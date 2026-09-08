import { describe, expect, it } from "vitest";
import { applyReorder } from "./reorder";
import type { Quest, QuestStatus } from "./types";

function quest(
  id: string,
  status: QuestStatus,
  position: number,
  overrides: Partial<Quest> = {},
): Quest {
  return {
    id,
    status,
    position,
    title: id,
    dueAt: null,
    tags: [],
    detail: "detail",
    note: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const board = [
  quest("a", "backlog", 0),
  quest("b", "backlog", 1),
  quest("c", "backlog", 2),
  quest("d", "in_progress", 0),
  quest("e", "done", 0),
];

function byId(quests: Quest[]) {
  return Object.fromEntries(quests.map((q) => [q.id, q]));
}

describe("applyReorder", () => {
  it("reorders within a column", () => {
    const next = byId(
      applyReorder(board, [{ status: "backlog", ids: ["c", "a", "b"] }]),
    );
    expect(next.c.position).toBe(0);
    expect(next.a.position).toBe(1);
    expect(next.b.position).toBe(2);
  });

  it("moves a quest between columns using both group lists", () => {
    const next = byId(
      applyReorder(board, [
        { status: "backlog", ids: ["a", "c"] },
        { status: "in_progress", ids: ["d", "b"] },
      ]),
    );
    expect(next.b.status).toBe("in_progress");
    expect(next.b.position).toBe(1);
    expect(next.c.position).toBe(1);
    expect(next.d.position).toBe(0);
  });

  it("leaves quests outside every group untouched", () => {
    const next = applyReorder(board, [
      { status: "backlog", ids: ["b", "a", "c"] },
    ]);
    const e = next.find((q) => q.id === "e");
    expect(e).toBe(board[4]);
  });

  it("keeps object identity for quests whose slot did not change", () => {
    const next = applyReorder(board, [
      { status: "backlog", ids: ["a", "c", "b"] },
    ]);
    const a = next.find((q) => q.id === "a");
    expect(a).toBe(board[0]);
  });

  it("ignores ids that are not on the board", () => {
    const next = applyReorder(board, [{ status: "done", ids: ["ghost", "e"] }]);
    expect(next).toHaveLength(board.length);
    expect(byId(next).e.position).toBe(1);
  });

  it("stamps updatedAt only on changed quests when given a timestamp", () => {
    const now = "2026-09-08T10:00:00.000Z";
    const next = byId(
      applyReorder(board, [{ status: "backlog", ids: ["b", "a", "c"] }], now),
    );
    expect(next.a.updatedAt).toBe(now);
    expect(next.b.updatedAt).toBe(now);
    expect(next.c.updatedAt).toBe(board[2].updatedAt);
  });

  it("does not touch updatedAt without a timestamp", () => {
    const next = byId(
      applyReorder(board, [{ status: "backlog", ids: ["b", "a", "c"] }]),
    );
    expect(next.a.updatedAt).toBe(board[0].updatedAt);
  });

  it("does not mutate the input", () => {
    const snapshot = JSON.stringify(board);
    applyReorder(board, [{ status: "done", ids: ["a", "b", "c", "d", "e"] }]);
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});
