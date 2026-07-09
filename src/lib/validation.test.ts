import { describe, expect, it } from "vitest";
import {
  createQuestSchema,
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
