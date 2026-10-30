import { describe, expect, it } from "vitest";
import { planMove } from "./move";

const column = ["a", "b", "c", "d"].map((id, position) => ({ id, position }));

describe("planMove", () => {
  it.each([
    ["after a card", "a", "b", ["a", "x", "b", "c", "d"]],
    ["at the top", null, "a", ["x", "a", "b", "c", "d"]],
    ["at the end", "d", null, ["a", "b", "c", "d", "x"]],
    [
      "after a card that left, before one still here",
      "gone",
      "c",
      ["a", "b", "x", "c", "d"],
    ],
    [
      "at the top when the card below left",
      null,
      "gone",
      ["x", "a", "b", "c", "d"],
    ],
    [
      "at the end when both neighbours left",
      "gone",
      "also-gone",
      ["a", "b", "c", "d", "x"],
    ],
  ])("places a card from another column %s", (_, afterId, beforeId, order) => {
    const rows = planMove(column, "x", afterId, beforeId);
    const result = new Map(column.map((q) => [q.id, q.position]));
    for (const r of rows) result.set(r.id, r.position);
    expect(
      [...result.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id),
    ).toEqual(order);
  });

  it("writes only the cards whose place changed, plus the moved card", () => {
    expect(planMove(column, "x", "b", "c")).toEqual([
      { id: "x", position: 2 },
      { id: "c", position: 3 },
      { id: "d", position: 4 },
    ]);
    expect(planMove(column, "x", "d", null)).toEqual([
      { id: "x", position: 4 },
    ]);
  });

  it("moves within a column without counting the card twice", () => {
    expect(planMove(column, "d", null, "a")).toEqual([
      { id: "d", position: 0 },
      { id: "a", position: 1 },
      { id: "b", position: 2 },
      { id: "c", position: 3 },
    ]);
    expect(planMove(column, "a", "c", "d")).toEqual([
      { id: "b", position: 0 },
      { id: "c", position: 1 },
      { id: "a", position: 2 },
    ]);
  });

  it("settles ties and gaps by position, then id", () => {
    const messy = [
      { id: "b", position: 5 },
      { id: "a", position: 5 },
      { id: "c", position: 9 },
    ];
    expect(planMove(messy, "x", "c", null)).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
      { id: "x", position: 3 },
    ]);
  });

  it("places the only card in an empty column", () => {
    expect(planMove([], "x", null, null)).toEqual([{ id: "x", position: 0 }]);
  });
});
