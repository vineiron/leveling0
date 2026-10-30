import { describe, expect, it } from "vitest";
import { IMPORT_MAX_QUESTS } from "./quests/limits";
import {
  createQuestSchema,
  importQuestsSchema,
  moveQuestSchema,
  updateQuestSchema,
} from "./validation";

const validCreate = {
  title: "Send the file before someone asks again",
  status: "in_progress" as const,
  detail: "Attach the right version.",
  note: "",
  tags: ["follow up"],
  dueAt: null,
};

describe("createQuestSchema", () => {
  it("accepts a valid create payload", () => {
    const parsed = createQuestSchema.safeParse(validCreate);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing detail", () => {
    const parsed = createQuestSchema.safeParse({
      ...validCreate,
      detail: "   ",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const parsed = createQuestSchema.safeParse({
      ...validCreate,
      ownerId: "nope",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("updateQuestSchema", () => {
  it("accepts partial updates", () => {
    const parsed = updateQuestSchema.safeParse({ title: "Renamed quest" });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty detail when provided", () => {
    const parsed = updateQuestSchema.safeParse({ detail: "" });
    expect(parsed.success).toBe(false);
  });
});

describe("moveQuestSchema", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("accepts a column and two neighbours, either of which may be empty", () => {
    expect(
      moveQuestSchema.safeParse({ status: "done", afterId: id, beforeId: null })
        .success,
    ).toBe(true);
    expect(
      moveQuestSchema.safeParse({
        status: "backlog",
        afterId: null,
        beforeId: null,
      }).success,
    ).toBe(true);
  });

  it("rejects bad ids, missing neighbours and unknown fields", () => {
    expect(
      moveQuestSchema.safeParse({
        status: "done",
        afterId: "nope",
        beforeId: null,
      }).success,
    ).toBe(false);
    expect(
      moveQuestSchema.safeParse({ status: "done", afterId: null }).success,
    ).toBe(false);
    expect(
      moveQuestSchema.safeParse({
        status: "done",
        afterId: null,
        beforeId: null,
        position: 3,
      }).success,
    ).toBe(false);
  });
});

describe("importQuestsSchema", () => {
  const item = { ...validCreate, id: "33333333-3333-4333-8333-333333333333" };

  it("accepts quests with ids and optional dates", () => {
    const parsed = importQuestsSchema.safeParse({
      quests: [{ ...item, createdAt: "2026-01-02T03:04:05.000Z" }],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.quests[0].createdAt).toEqual(
      new Date("2026-01-02T03:04:05.000Z"),
    );
  });

  it("rejects duplicate ids, missing ids and unknown fields", () => {
    expect(importQuestsSchema.safeParse({ quests: [item, item] }).success).toBe(
      false,
    );
    expect(
      importQuestsSchema.safeParse({ quests: [validCreate] }).success,
    ).toBe(false);
    expect(
      importQuestsSchema.safeParse({ quests: [{ ...item, userId: "nope" }] })
        .success,
    ).toBe(false);
  });

  it("rejects an empty list and anything over the limit", () => {
    expect(importQuestsSchema.safeParse({ quests: [] }).success).toBe(false);
    const tooMany = Array.from({ length: IMPORT_MAX_QUESTS + 1 }, (_, i) => ({
      ...item,
      id: `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`,
    }));
    expect(importQuestsSchema.safeParse({ quests: tooMany }).success).toBe(
      false,
    );
  });
});
