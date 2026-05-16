import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import type { ItemStatus } from "@/lib/items/types";
import { checkOrigin } from "@/lib/security";
import { getCurrentUserId } from "@/lib/supabase/server";
import { reorderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const originError = checkOrigin(request);
  if (originError) return originError;

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updates: Array<{ id: string; status: ItemStatus; position: number }> = [];
  for (const group of parsed.data.groups) {
    group.ids.forEach((id: string, position: number) => {
      updates.push({ id, status: group.status, position });
    });
  }

  if (updates.length === 0) {
    return NextResponse.json({ ok: true });
  }

  // Single bulk UPDATE driven by a VALUES join. The WHERE on user_id ensures
  // rows not owned by the caller are silently skipped (same behavior as the
  // prior per-row implementation, but one round-trip instead of N). Every row
  // is cast explicitly so Postgres never has to infer a bind-param's type.
  const valuesParts = updates.map(
    (u) => sql`(${u.id}::uuid, ${u.status}::item_status, ${u.position}::int)`,
  );

  await db.execute(sql`
    UPDATE items
    SET status = data.status,
        position = data.position,
        updated_at = NOW()
    FROM (VALUES ${sql.join(valuesParts, sql`, `)}) AS data(id, status, position)
    WHERE items.id = data.id AND items.user_id = ${userId}::uuid
  `);

  return NextResponse.json({ ok: true });
}
