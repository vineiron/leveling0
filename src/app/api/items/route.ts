import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { dbItemToItem } from "@/lib/items/serialize";
import type { ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES } from "@/lib/items/types";
import { getCurrentUserId } from "@/lib/supabase/server";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(asc(items.status), asc(items.position));
  return NextResponse.json({ items: rows.map(dbItemToItem) });
}

type PostBody = {
  title?: unknown;
  status?: unknown;
  dueAt?: unknown;
  tags?: unknown;
  detail?: unknown;
  note?: unknown;
};

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PostBody;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!ITEM_STATUSES.includes(body.status as ItemStatus)) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }
  const status = body.status as ItemStatus;
  const detail = typeof body.detail === "string" ? body.detail : "";
  if (!detail.trim()) {
    return NextResponse.json({ error: "Detail is required" }, { status: 400 });
  }
  const dueAt =
    typeof body.dueAt === "string" && body.dueAt ? new Date(body.dueAt) : null;
  const tags =
    Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0)
      : [];
  const note = typeof body.note === "string" ? body.note : "";

  const [{ maxPos }] = await db
    .select({ maxPos: max(items.position) })
    .from(items)
    .where(eq(items.userId, userId));

  const [created] = await db
    .insert(items)
    .values({
      userId,
      status,
      position: (maxPos ?? -1) + 1,
      title,
      dueAt,
      tags,
      detail,
      note,
    })
    .returning();

  return NextResponse.json({ item: dbItemToItem(created) }, { status: 201 });
}
