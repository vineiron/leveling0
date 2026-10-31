import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { quests } from "@/db/schema";
import { BOARD_MAX_BYTES, QUEST_BASE_BYTES } from "@/lib/quests/limits";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const BOARD_FULL = Symbol("board full");

class OverBudget extends Error {}

async function boardBytes(tx: Tx, userId: string) {
  const [{ bytes }] = await tx
    .select({
      bytes:
        sql<number>`coalesce(sum(octet_length(${quests.title}) + octet_length(${quests.detail}) + octet_length(${quests.note}) + octet_length(array_to_string(${quests.tags}, '')) + ${QUEST_BASE_BYTES}), 0)`.mapWith(
          Number,
        ),
    })
    .from(quests)
    .where(eq(quests.userId, userId));
  return bytes;
}

export async function withinBudget<T>(
  userId: string,
  write: (tx: Tx) => Promise<T>,
): Promise<T | typeof BOARD_FULL> {
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const before = await boardBytes(tx, userId);
      const result = await write(tx);
      const after = await boardBytes(tx, userId);
      if (after > before && after > BOARD_MAX_BYTES) throw new OverBudget();
      return result;
    });
  } catch (e) {
    if (e instanceof OverBudget) return BOARD_FULL;
    throw e;
  }
}

export function boardFullResponse() {
  return NextResponse.json(
    {
      error: `This would take your board past its ${BOARD_MAX_BYTES / 1_000_000} MB limit. Delete or shorten some quests to make room.`,
    },
    { status: 409 },
  );
}
