import { describe, expect, it } from "vitest";
import { exportFileName, questFileJson, readQuestFile } from "./files";
import type { Quest } from "./types";

const NOW = new Date(2026, 9, 29, 23, 30);

function quest(id: string, extra: Partial<Quest> = {}): Quest {
  return {
    id,
    status: "backlog",
    position: 0,
    title: "Renew passport",
    dueAt: null,
    tags: ["errands"],
    detail: "Bring the old one.",
    note: "Private note",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...extra,
  };
}

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("exportFileName", () => {
  it.each([
    [
      "one quest",
      [quest(A, { title: "Fix bike: rear brake!" })],
      "fix-bike-rear-brake",
    ],
    ["one column", [quest(A), quest(B)], "quest-log"],
    ["mixed columns", [quest(A), quest(B, { status: "done" })], "quests"],
    ["a title with no latin letters", [quest(A, { title: "日本" })], "quest"],
  ])("names %s by what is in it", (_, quests, what) => {
    expect(exportFileName(quests, NOW)).toBe(
      `leveling0-${what}-2026-10-29.json`,
    );
  });
});

describe("quest files", () => {
  it("reads back what it writes, in column order and with notes", async () => {
    const quests = [
      quest(A, { status: "done", position: 0 }),
      quest(B, { position: 1 }),
      quest(C, { position: 0, dueAt: "2026-11-01T09:00:00.000Z" }),
    ];

    const file = await readQuestFile(questFileJson(quests));

    expect(file?.skipped).toBe(0);
    expect(file?.quests.map((q) => [q.id, q.status, q.position])).toEqual([
      [C, "backlog", 0],
      [B, "backlog", 1],
      [A, "done", 2],
    ]);
    expect(file?.quests[0]).toEqual({ ...quests[2], position: 0 });
    expect(questFileJson(quests)).not.toContain('"position"');
  });

  it("skips quests it can't import and repeats of the same id", async () => {
    const text = JSON.stringify({
      quests: [
        JSON.parse(questFileJson([quest(A)])).quests[0],
        { ...JSON.parse(questFileJson([quest(A)])).quests[0], title: "Again" },
        { id: "not-a-uuid", title: "x", status: "backlog", detail: "y" },
        { ...JSON.parse(questFileJson([quest(B)])).quests[0], detail: "" },
      ],
    });

    const file = await readQuestFile(text);

    expect(file?.quests.map((q) => q.id)).toEqual([A]);
    expect(file?.skipped).toBe(3);
  });

  it.each([
    ["broken JSON", "{not json"],
    ["a list instead of a file", "[]"],
    ["an object without quests", '{"items": []}'],
  ])("returns nothing for %s", async (_, text) => {
    expect(await readQuestFile(text)).toBeNull();
  });
});
