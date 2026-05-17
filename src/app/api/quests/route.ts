import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { quests } from "@/db/schema";
import { dbQuestToQuest } from "@/lib/quests/serialize";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { createQuestSchema } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(quests)
    .where(eq(quests.userId, userId))
    .orderBy(asc(quests.status), asc(quests.position));
  return NextResponse.json({ quests: rows.map(dbQuestToQuest) });
}

export async function POST(request: Request) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = createQuestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const [{ maxPos }] = await db
    .select({ maxPos: max(quests.position) })
    .from(quests)
    .where(eq(quests.userId, userId));

  const [created] = await db
    .insert(quests)
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

  return NextResponse.json({ quest: dbQuestToQuest(created) }, { status: 201 });
}
