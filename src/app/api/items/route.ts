import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { dbItemToItem } from "@/lib/items/serialize";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { createItemSchema } from "@/lib/validation";

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

export async function POST(request: Request) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const [{ maxPos }] = await db
    .select({ maxPos: max(items.position) })
    .from(items)
    .where(eq(items.userId, userId));

  const [created] = await db
    .insert(items)
    .values({
      userId,
      status: data.status,
      position: (maxPos ?? -1) + 1,
      title: data.title,
      dueAt: data.dueAt,
      tags: data.tags,
      detail: data.detail,
      note: data.note,
    })
    .returning();

  return NextResponse.json({ item: dbItemToItem(created) }, { status: 201 });
}
