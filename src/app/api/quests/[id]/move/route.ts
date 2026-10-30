import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { quests } from "@/db/schema";
import { planMove } from "@/lib/quests/move";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { moveQuestSchema, questIdSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: RouteContext) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = questIdSchema.safeParse((await ctx.params).id);
  if (!id.success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = moveQuestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { status, afterId, beforeId } = parsed.data;

  const rows = await db
    .select({ id: quests.id, position: quests.position })
    .from(quests)
    .where(
      and(
        eq(quests.userId, userId),
        or(eq(quests.status, status), eq(quests.id, id.data)),
      ),
    );
  if (!rows.some((row) => row.id === id.data)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const placed = planMove(rows, id.data, afterId, beforeId).map(
    (row) => sql`(${row.id}::uuid, ${row.position}::int)`,
  );
  await db.execute(sql`
    UPDATE quests
    SET status = CASE WHEN quests.id = ${id.data}::uuid THEN ${status}::quest_status ELSE quests.status END,
        position = data.position,
        updated_at = CASE WHEN quests.id = ${id.data}::uuid AND quests.status <> ${status}::quest_status THEN NOW() ELSE quests.updated_at END
    FROM (VALUES ${sql.join(placed, sql`, `)}) AS data(id, position)
    WHERE quests.id = data.id AND quests.user_id = ${userId}::uuid
  `);

  return NextResponse.json({ ok: true });
}
