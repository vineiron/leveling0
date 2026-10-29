import { describe, expect, it } from "vitest";
import { createQuestSchema } from "@/lib/validation";
import { describeIssue } from "./errors";
import { fitsLimits, limitIssues, QUEST_LIMITS } from "./limits";

const base = {
  title: "Renew passport",
  status: "backlog" as const,
  dueAt: null,
  tags: ["errands"],
  detail: "Bring the old one.",
  note: "",
};

const atMax = {
  ...base,
  title: "t".repeat(QUEST_LIMITS.title),
  detail: "d".repeat(QUEST_LIMITS.detail),
  note: "n".repeat(QUEST_LIMITS.note),
  tags: Array.from({ length: QUEST_LIMITS.tags }, (_, i) =>
    `${i}`.padEnd(QUEST_LIMITS.tag, "x"),
  ),
};

describe("fitsLimits", () => {
  it.each([
    ["a quest at every limit", atMax, true],
    ["a long title", { ...base, title: `${atMax.title}t` }, false],
    ["a long detail", { ...base, detail: `${atMax.detail}d` }, false],
    ["a long note", { ...base, note: `${atMax.note}n` }, false],
    ["too many tags", { ...base, tags: [...atMax.tags, "one more"] }, false],
    ["a long tag", { ...base, tags: [`${atMax.tags[0]}x`] }, false],
  ])("agrees with the server schema on %s", (_, quest, fits) => {
    const server = createQuestSchema.safeParse(quest);
    expect(fitsLimits(quest)).toBe(fits);
    expect(server.success).toBe(fits);
    expect(limitIssues(quest).map(describeIssue)).toEqual(
      (server.error?.issues ?? []).map(describeIssue),
    );
  });
});
