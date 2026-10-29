import { describe, expect, it } from "vitest";
import { IMPORT_MAX_QUESTS } from "./quests/limits";
import {
  createQuestSchema,
  importQuestsSchema,
  reorderSchema,
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

describe("reorderSchema", () => {
  it("accepts unique ids across groups", () => {
    const parsed = reorderSchema.safeParse({
      groups: [
        {
          status: "backlog",
          ids: ["11111111-1111-4111-8111-111111111111"],
        },
        {
          status: "done",
          ids: ["22222222-2222-4222-8222-222222222222"],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects duplicate ids across groups", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const parsed = reorderSchema.safeParse({
      groups: [
        { status: "backlog", ids: [id] },
        { status: "done", ids: [id] },
      ],
    });
    expect(parsed.success).toBe(false);
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
