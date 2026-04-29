import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { dbItemToItem } from "@/lib/items/serialize";
import type { ItemStatus } from "@/lib/items/types";
import { ITEM_STATUSES } from "@/lib/items/types";
import { getCurrentUserId } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  title?: unknown;
  status?: unknown;
  position?: unknown;
  dueAt?: unknown;
  tags?: unknown;
  detail?: unknown;
  note?: unknown;
};

export async function PATCH(request: Request, ctx: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as PatchBody;

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    patch.title = t;
  }
  if (body.status !== undefined) {
    if (!ITEM_STATUSES.includes(body.status as ItemStatus)) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (typeof body.position === "number") patch.position = body.position;
  if (body.dueAt === null) patch.dueAt = null;
  else if (typeof body.dueAt === "string" && body.dueAt) patch.dueAt = new Date(body.dueAt);
  if (Array.isArray(body.tags))
    patch.tags = body.tags.filter((t): t is string => typeof t === "string");
  if (typeof body.detail === "string") {
    if (!body.detail.trim()) {
      return NextResponse.json({ error: "Detail is required" }, { status: 400 });
    }
    patch.detail = body.detail;
  }
  if (typeof body.note === "string") patch.note = body.note;

  const [updated] = await db
    .update(items)
    .set(patch)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: dbItemToItem(updated) });
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const deleted = await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .returning({ id: items.id });
  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
