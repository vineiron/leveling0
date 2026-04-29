import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import type { ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES } from "@/lib/items/types";
import { getCurrentUserId } from "@/lib/supabase/server";

type ReorderBody = {
  groups?: Array<{ status?: unknown; ids?: unknown }>;
};

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as ReorderBody;
  if (!Array.isArray(body.groups)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allIds: string[] = [];
  const updates: Array<{ id: string; status: ItemStatus; position: number }> = [];
  for (const group of body.groups) {
    const status = group.status as ItemStatus;
    if (!ITEM_STATUSES.includes(status)) continue;
    if (!Array.isArray(group.ids)) continue;
    group.ids.forEach((id, position) => {
      if (typeof id !== "string") return;
      allIds.push(id);
      updates.push({ id, status, position });
    });
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: true });
  }

  await db.transaction(async (tx) => {
    const owned = await tx
      .select({ id: items.id })
      .from(items)
      .where(and(eq(items.userId, userId), inArray(items.id, allIds)));
    const ownedSet = new Set(owned.map((r) => r.id));
    const now = new Date();
    for (const u of updates) {
      if (!ownedSet.has(u.id)) continue;
      await tx
        .update(items)
        .set({ status: u.status, position: u.position, updatedAt: now })
        .where(and(eq(items.id, u.id), eq(items.userId, userId)));
    }
  });

  return NextResponse.json({ ok: true });
}
