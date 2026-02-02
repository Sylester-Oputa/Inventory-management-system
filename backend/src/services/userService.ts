import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { buildError } from '../utils/errors';

export type StaffInput = {
  name: string;
  username: string;
  password: string;
};

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createStaff(payload: StaffInput) {
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const staff = await prisma.user.create({
    data: {
      name: payload.name,
      username: payload.username,
      passwordHash,
      role: 'STAFF',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return staff;
}

export async function toggleUser(id: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw buildError(404, 'user-not-found');
  }
  if (user.role === 'OWNER' && !isActive) {
    throw buildError(400, 'cannot-disable-owner');
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return updated;
}

export async function resetPassword(id: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw buildError(404, 'user-not-found');
  }
  if (user.role !== 'STAFF') {
    throw buildError(400, 'only-staff-password-reset');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await prisma.user.update({
    where: { id },
    data: { passwordHash },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return updated;
}
