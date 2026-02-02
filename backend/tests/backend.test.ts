import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

jest.setTimeout(120000);

const ownerPayload = {
  name: 'Owner Person',
  username: 'owner@example.com',
  password: 'StrongPass#1',
};

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number) {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "SaleLotAllocation",
      "SaleItem",
      "Sale",
      "StockLot",
      "StockInItem",
      "StockIn",
      "Product",
      "DailySequence",
      "User"
    RESTART IDENTITY CASCADE;
  `);
}

async function setupOwner() {
  await request(app).post('/setup/owner').send(ownerPayload).expect(201);
  const login = await request(app)
    .post('/auth/login')
    .send({ username: ownerPayload.username, password: ownerPayload.password })
    .expect(200);
  return login.body.token as string;
}

async function createProduct(token: string, name: string, price = 12.5) {
  const response = await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, sellingPrice: price });
  return response.body;
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Setup flow', () => {
  it('creates owner once, second call returns 409', async () => {
    await request(app).post('/setup/owner').send(ownerPayload).expect(201);
    await request(app).post('/setup/owner').send(ownerPayload).expect(409);
  });
});

describe('Products and stock-in', () => {
  it('owner can create product', async () => {
    const token = await setupOwner();
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Vitamin C', sellingPrice: 15 })
      .expect(201);

    expect(response.body.name).toBe('Vitamin C');
  });

  it('stock-in creates lot with expiry and updates inventory totals', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'Restock Item');
    const expiry = toDateString(addDays(new Date(), 40));

    const stockIn = await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, qtyAdded: 7, expiryDate: expiry }],
      })
      .expect(201);

    expect(stockIn.body.items[0].stockLots[0].expiryDate).toContain(expiry);

    const inventory = await request(app)
      .get('/inventory')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const entry = inventory.body.find((item: any) => item.id === product.id);
    expect(entry.totalQty).toBe(7);
  });
});

describe('Sales FEFO', () => {
  it('uses earliest expiry lot first', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'FEFO Item', 20);
    const early = toDateString(addDays(new Date(), 10));
    const late = toDateString(addDays(new Date(), 30));

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: product.id, qtyAdded: 5, expiryDate: early },
          { productId: product.id, qtyAdded: 5, expiryDate: late },
        ],
      })
      .expect(201);

    const sale = await request(app)
      .post('/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, qty: 3 }] })
      .expect(201);

    const allocations = sale.body.items[0].allocations;
    expect(allocations[0].stockLot.expiryDate).toContain(early);
  });

  it('allocates across multiple lots when needed', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'Multi Lot', 20);
    const early = toDateString(addDays(new Date(), 5));
    const late = toDateString(addDays(new Date(), 20));

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: product.id, qtyAdded: 2, expiryDate: early },
          { productId: product.id, qtyAdded: 5, expiryDate: late },
        ],
      })
      .expect(201);

    const sale = await request(app)
      .post('/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, qty: 6 }] })
      .expect(201);

    const allocations = sale.body.items[0].allocations;
    const first = allocations.find((allocation: any) => allocation.stockLot.expiryDate.includes(early));
    const second = allocations.find((allocation: any) => allocation.stockLot.expiryDate.includes(late));

    expect(first.qtyTaken).toBe(2);
    expect(second.qtyTaken).toBe(4);
  });

  it('rejects sale if insufficient stock', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'Insufficient Stock', 20);
    const expiry = toDateString(addDays(new Date(), 15));

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, qtyAdded: 2, expiryDate: expiry }] })
      .expect(201);

    await request(app)
      .post('/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, qty: 5 }] })
      .expect(400);
  });
});

describe('Role enforcement', () => {
  it('prevents staff from creating products or restocking', async () => {
    const token = await setupOwner();
    const staff = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Staff', username: 'staff@example.com', password: 'Password#1' })
      .expect(201);

    const login = await request(app)
      .post('/auth/login')
      .send({ username: staff.body.username, password: 'Password#1' })
      .expect(200);

    const staffToken = login.body.token;

    await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Blocked Product', sellingPrice: 5 })
      .expect(403);

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ items: [{ productId: staff.body.id, qtyAdded: 1, expiryDate: toDateString(addDays(new Date(), 1)) }] })
      .expect(403);
  });
});

describe('Sales reporting', () => {
  it('lets owner filter sales by staff and date', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'Report Product');
    const expiry = toDateString(addDays(new Date(), 20));

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, qtyAdded: 8, expiryDate: expiry }] })
      .expect(201);

    const staff = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Report Staff', username: 'reportstaff@example.com', password: 'Password#1' })
      .expect(201);

    const staffLogin = await request(app)
      .post('/auth/login')
      .send({ username: staff.body.username, password: 'Password#1' })
      .expect(200);

    await request(app)
      .post('/sales')
      .set('Authorization', `Bearer ${staffLogin.body.token}`)
      .send({ items: [{ productId: product.id, qty: 2 }] })
      .expect(201);

    const today = new Date().toISOString().slice(0, 10);
    const response = await request(app)
      .get('/sales')
      .set('Authorization', `Bearer ${token}`)
      .query({ soldByUserId: staff.body.id, from: today, to: today })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((sale: any) => sale.soldBy?.id === staff.body.id)).toBe(true);
  });
});

describe('Expiring report', () => {
  it('returns lots within days window', async () => {
    const token = await setupOwner();
    const product = await createProduct(token, 'Expiry Product');
    const within = toDateString(addDays(new Date(), 10));
    const beyond = toDateString(addDays(new Date(), 90));

    await request(app)
      .post('/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: product.id, qtyAdded: 5, expiryDate: within },
          { productId: product.id, qtyAdded: 5, expiryDate: beyond },
        ],
      })
      .expect(201);

    const report = await request(app)
      .get('/reports/expiring')
      .set('Authorization', `Bearer ${token}`)
      .query({ days: 30 })
      .expect(200);

    const hasWithin = report.body.some((lot: any) => lot.expiryDate.includes(within));
    const hasBeyond = report.body.some((lot: any) => lot.expiryDate.includes(beyond));

    expect(hasWithin).toBe(true);
    expect(hasBeyond).toBe(false);
  });
});
