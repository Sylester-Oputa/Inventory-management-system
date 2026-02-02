import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { env } from "../config/env";
import { buildError } from "../utils/errors";

export async function authenticate(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    throw buildError(401, "invalid-credentials");
  }
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw buildError(401, "invalid-credentials");
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: "6h",
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw buildError(404, "user-not-found");
  }
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    throw buildError(401, "invalid-credentials");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { updated: true };
}

export async function resetOwnerPasswordWithRecoveryCode(
  username: string,
  recoveryCode: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw buildError(404, "user-not-found");
  }
  if (user.role !== "OWNER") {
    throw buildError(400, "recovery-code-owner-only");
  }
  if (!user.recoveryCodeHash) {
    throw buildError(400, "no-recovery-code-set");
  }
  const matches = await bcrypt.compare(recoveryCode, user.recoveryCodeHash);
  if (!matches) {
    throw buildError(401, "invalid-recovery-code");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { updated: true };
}
