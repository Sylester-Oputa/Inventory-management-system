import prisma from "../prisma";
import { buildError } from "../utils/errors";

export type StoreInput = {
  name: string;
  address: string;
  phone: string;
  backupFolder?: string;
};

export async function getStoreInfo() {
  let store = await prisma.store.findFirst();

  // If no store exists, create a default one
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: "EliMed Store",
        address: "Store Address",
        phone: "Contact Number",
      },
    });
  }

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    phone: store.phone,
    backupFolder: store.backupFolder,
  };
}

export async function updateStoreInfo(payload: StoreInput) {
  // Get existing store or create if doesn't exist
  const existingStore = await prisma.store.findFirst();

  let store;
  if (existingStore) {
    store = await prisma.store.update({
      where: { id: existingStore.id },
      data: {
        name: payload.name,
        address: payload.address,
        phone: payload.phone,
        backupFolder: payload.backupFolder || existingStore.backupFolder,
      },
    });
  } else {
    store = await prisma.store.create({
      data: {
        name: payload.name,
        address: payload.address,
        phone: payload.phone,
        backupFolder: payload.backupFolder,
      },
    });
  }

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    phone: store.phone,
    backupFolder: store.backupFolder,
  };
}
