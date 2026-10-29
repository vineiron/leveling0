import { describe, expect, it } from "vitest";
import type { ImportQuest } from "@/lib/validation";
import { planImport } from "./importPlan";

const ME = "11111111-1111-4111-8111-111111111111";
const SOMEONE = "99999999-9999-4999-8999-999999999999";
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = new Date("2026-10-29T00:00:00.000Z");

function quest(id: string, extra: Partial<ImportQuest> = {}): ImportQuest {
  return {
    id,
    title: "Renew passport",
    status: "backlog",
    dueAt: null,
    tags: [],
    detail: "Bring the old one.",
    note: "",
    ...extra,
  };
}

const neverCalled = () => {
  throw new Error("newId should not be called");
};

describe("planImport", () => {
  it("keeps new ids and appends them in order after the start position", () => {
    const plan = planImport(
      ME,
      [quest(A), quest(B, { status: "done" })],
      [],
      5,
      NOW,
      neverCalled,
    );

    expect(
      plan.rows.map((r) => [r.id, r.userId, r.status, r.position]),
    ).toEqual([
      [A, ME, "backlog", 5],
      [B, ME, "done", 6],
    ]);
    expect(plan.alreadyHere).toEqual([]);
    expect(plan.sourceOf.get(B)).toBe(B);
  });

  it("skips quests this user already has", () => {
    const plan = planImport(
      ME,
      [quest(A), quest(B)],
      [{ id: A, userId: ME }],
      0,
      NOW,
      neverCalled,
    );

    expect(plan.rows.map((r) => [r.id, r.position])).toEqual([[B, 0]]);
    expect(plan.alreadyHere).toEqual([A]);
  });

  it("gives a new id when someone else holds the id, and never touches theirs", () => {
    const plan = planImport(
      ME,
      [quest(A)],
      [{ id: A, userId: SOMEONE }],
      0,
      NOW,
      () => B,
    );

    expect(plan.rows.map((r) => [r.id, r.userId])).toEqual([[B, ME]]);
    expect(plan.sourceOf.get(B)).toBe(A);
    expect(plan.alreadyHere).toEqual([]);
  });

  it("keeps past dates and never lets them pass now", () => {
    const past = new Date("2026-03-01T00:00:00.000Z");
    const future = new Date("2027-01-01T00:00:00.000Z");
    const plan = planImport(
      ME,
      [quest(A, { createdAt: past, updatedAt: future }), quest(B)],
      [],
      0,
      NOW,
      neverCalled,
    );

    expect(plan.rows.map((r) => [r.createdAt, r.updatedAt])).toEqual([
      [past, NOW],
      [NOW, NOW],
    ]);
  });
});
