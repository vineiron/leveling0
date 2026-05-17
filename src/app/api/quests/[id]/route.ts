import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { quests } from "@/db/schema";
import { dbQuestToQuest } from "@/lib/quests/serialize";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { updateQuestSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteContext) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const raw = await request.json().catch(() => null);
  const parsed = updateQuestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) patch.title = data.title;
  if (data.status !== undefined) patch.status = data.status;
  if (data.position !== undefined) patch.position = data.position;
  if (data.dueAt !== undefined) patch.dueAt = data.dueAt;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.detail !== undefined) patch.detail = data.detail;
  if (data.note !== undefined) patch.note = data.note;

  const [updated] = await db
    .update(quests)
    .set(patch)
    .where(and(eq(quests.id, id), eq(quests.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ quest: dbQuestToQuest(updated) });
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const deleted = await db
    .delete(quests)
    .where(and(eq(quests.id, id), eq(quests.userId, userId)))
    .returning({ id: quests.id });
  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
