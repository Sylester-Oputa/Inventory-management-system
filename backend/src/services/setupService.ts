import bcrypt from "bcrypt";
import prisma from "../prisma";
import { buildError } from "../utils/errors";

function generateRecoveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type OwnerInput = {
  name: string;
  username: string;
  password: string;
};

export async function createOwner(payload: OwnerInput) {
  // DEBUG: Log what's received
  console.log("=== BACKEND RECEIVED ===");
  console.log("Name:", payload.name);
  console.log("Username:", payload.username);
  console.log("Password:", payload.password);
  console.log("Password length:", payload.password.length);
  console.log("=======================");

  const existingOwner = await prisma.user.findFirst({
    where: { role: "OWNER" },
  });
  if (existingOwner) {
    throw buildError(409, "owner-already-exists");
  }
  const passwordHash = await bcrypt.hash(payload.password, 10);
  console.log("Password hash:", passwordHash);

  // Generate recovery code for offline password reset
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await bcrypt.hash(recoveryCode, 10);
  console.log("Recovery code generated:", recoveryCode);

  const owner = await prisma.user.create({
    data: {
      name: payload.name,
      username: payload.username,
      passwordHash,
      recoveryCodeHash,
      role: "OWNER",
      isActive: true,
    },
  });
  return {
    id: owner.id,
    name: owner.name,
    username: owner.username,
    role: owner.role,
    isActive: owner.isActive,
    createdAt: owner.createdAt,
    recoveryCode, // Return recovery code to display to user
  };
}
