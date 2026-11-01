import { describe, expect, it } from "vitest";
import { ApiError, describeIssue, errorMessage, MESSAGES } from "./errors";

describe("errorMessage", () => {
  it("turns a failed fetch into the connection message", () => {
    expect(errorMessage(new TypeError("Failed to fetch"))).toBe(
      MESSAGES.offline,
    );
    expect(errorMessage(new TypeError("Load failed"))).toBe(MESSAGES.offline);
  });

  it("keeps the app's own messages", () => {
    expect(errorMessage(new ApiError([MESSAGES.boardFull], 409))).toBe(
      MESSAGES.boardFull,
    );
    expect(errorMessage(new Error(MESSAGES.browserFull))).toBe(
      MESSAGES.browserFull,
    );
    expect(errorMessage("plain")).toBe("plain");
  });
});

describe("describeIssue", () => {
  it("writes limits with a thousands separator", () => {
    expect(
      describeIssue({
        code: "too_big",
        origin: "string",
        maximum: 20_000,
        path: ["detail"],
      }),
    ).toBe("Detail is too long (max 20,000 characters).");
    expect(
      describeIssue({
        code: "too_big",
        origin: "array",
        maximum: 15,
        path: ["tags"],
      }),
    ).toBe("Too many tags (max 15).");
  });
});
