import { describe, expect, it } from "vitest";
import { checkOrigin, safeRedirectPath } from "./security";

function requestWith(headers: Record<string, string>) {
  return new Request("http://localhost:3000/api/quests", {
    method: "POST",
    headers,
  });
}

describe("checkOrigin", () => {
  it("allows requests with no Origin header", () => {
    expect(checkOrigin(requestWith({ host: "localhost:3000" }))).toBeNull();
  });

  it("allows same-origin browser requests", () => {
    expect(
      checkOrigin(
        requestWith({
          host: "localhost:3000",
          origin: "http://localhost:3000",
        }),
      ),
    ).toBeNull();
  });

  it("rejects cross-origin browser requests", async () => {
    const response = checkOrigin(
      requestWith({
        host: "localhost:3000",
        origin: "https://evil.example",
      }),
    );

    expect(response).not.toBeNull();
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("rejects invalid Origin values", async () => {
    const response = checkOrigin(
      requestWith({
        host: "localhost:3000",
        origin: "not-a-url",
      }),
    );

    expect(response?.status).toBe(403);
  });

  it("rejects Origin when Host is missing", async () => {
    const response = checkOrigin(
      requestWith({
        origin: "http://localhost:3000",
      }),
    );

    expect(response?.status).toBe(403);
  });
});

describe("safeRedirectPath", () => {
  const origin = "https://leveling0.vercel.app";

  it("keeps same-origin paths with query and hash", () => {
    expect(safeRedirectPath("/quests?x=1#top", origin)).toBe("/quests?x=1#top");
  });

  it("falls back to / for empty or non-path values", () => {
    expect(safeRedirectPath(null, origin)).toBe("/");
    expect(safeRedirectPath("", origin)).toBe("/");
    expect(safeRedirectPath("quests", origin)).toBe("/");
    expect(safeRedirectPath("https://evil.example/", origin)).toBe("/");
  });

  it("rejects protocol-relative and backslash hosts", () => {
    expect(safeRedirectPath("//evil.example", origin)).toBe("/");
    expect(safeRedirectPath("/\\evil.example", origin)).toBe("/");
    expect(safeRedirectPath("/\\evil.example/quests", origin)).toBe("/");
    expect(safeRedirectPath("/\\/evil.example", origin)).toBe("/");
  });
});
