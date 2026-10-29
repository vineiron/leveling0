import { eq, inArray, max } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { quests } from "@/db/schema";
import { planImport } from "@/lib/quests/importPlan";
import { dbQuestToQuest } from "@/lib/quests/serialize";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { importQuestsSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = importQuestsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const incoming = parsed.data.quests;

  const existing = await db
    .select({ id: quests.id, userId: quests.userId })
    .from(quests)
    .where(
      inArray(
        quests.id,
        incoming.map((q) => q.id),
      ),
    );
  const [{ maxPos }] = await db
    .select({ maxPos: max(quests.position) })
    .from(quests)
    .where(eq(quests.userId, userId));

  const plan = planImport(
    userId,
    incoming,
    existing,
    (maxPos ?? -1) + 1,
    new Date(),
    () => crypto.randomUUID(),
  );
  const inserted =
    plan.rows.length > 0
      ? await db
          .insert(quests)
          .values(plan.rows)
          .onConflictDoNothing({ target: quests.id })
          .returning()
      : [];

  return NextResponse.json({
    added: inserted.map((row) => ({
      from: plan.sourceOf.get(row.id) ?? row.id,
      quest: dbQuestToQuest(row),
    })),
    alreadyHere: plan.alreadyHere,
  });
}
