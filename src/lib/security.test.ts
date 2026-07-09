import { describe, expect, it } from "vitest";
import { checkOrigin } from "./security";

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
