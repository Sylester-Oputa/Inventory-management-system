import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { buildDateKey } from "../utils/date";

export async function getNextDailySequence(
  tx: Prisma.TransactionClient,
  type: string,
  date: Date = new Date(),
) {
  const dateKey = buildDateKey(date);

  await tx.$executeRaw(
    Prisma.sql`
      INSERT INTO "DailySequence" ("id", "dateKey", "type", "lastSeq")
      VALUES (lower(hex(randomblob(16))), ${dateKey}, ${type}, 0)
      ON CONFLICT ("dateKey", "type") DO NOTHING
    `,
  );

  const rows = await tx.$queryRaw<{ id: string; lastSeq: number }[]>(
    Prisma.sql`
      SELECT "id", "lastSeq"
      FROM "DailySequence"
      WHERE "dateKey" = ${dateKey}
        AND "type" = ${type}
    `,
  );

  if (!rows.length) {
    throw new Error("sequence-not-initialized");
  }

  const nextSeq = rows[0].lastSeq + 1;
  await tx.dailySequence.update({
    where: { id: rows[0].id },
    data: { lastSeq: nextSeq },
  });

  return { seq: nextSeq, dateKey };
}

export async function getNextDailySequenceWithTransaction(type: string) {
  return prisma.$transaction((tx) => getNextDailySequence(tx, type));
}
