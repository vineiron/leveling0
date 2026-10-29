import { describe, expect, it } from "vitest";
import { questCount } from "./format";

describe("questCount", () => {
  it("uses the singular only for one", () => {
    expect(questCount(0)).toBe("0 quests");
    expect(questCount(1)).toBe("1 quest");
    expect(questCount(7)).toBe("7 quests");
  });
});
