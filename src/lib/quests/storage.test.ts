import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";
import { apiStore, localStore } from "./storage";
import type { QuestDraft } from "./types";

const LS_KEY = "leveling0:items:v1";

const draft: QuestDraft = {
  title: "Return the library book",
  status: "backlog",
  dueAt: null,
  tags: ["errand"],
  detail: "Before the fine kicks in.",
  note: "",
};

function fakeLocalStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    raw: () => data.get(LS_KEY) ?? null,
  };
}

describe("localStore", () => {
  let storage: ReturnType<typeof fakeLocalStorage>;

  beforeEach(() => {
    storage = fakeLocalStorage();
    vi.stubGlobal("window", { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts empty and tolerates corrupt storage", async () => {
    expect(await localStore.list()).toEqual([]);
    storage.setItem(LS_KEY, "{not json");
    expect(await localStore.list()).toEqual([]);
    storage.setItem(LS_KEY, JSON.stringify({ nope: true }));
    expect(await localStore.list()).toEqual([]);
  });

  it("appends created quests at the end of their column", async () => {
    const first = await localStore.create(draft);
    const second = await localStore.create(draft);
    const other = await localStore.create({ ...draft, status: "done" });

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);
    expect(other.position).toBe(0);
    expect(first.id).not.toBe(second.id);
    expect(first.createdAt).toBe(first.updatedAt);
  });

  it("lists quests grouped by status then position", async () => {
    await localStore.create({ ...draft, title: "done-0", status: "done" });
    await localStore.create({ ...draft, title: "backlog-0" });
    await localStore.create({ ...draft, title: "backlog-1" });
    await localStore.create({
      ...draft,
      title: "in_progress-0",
      status: "in_progress",
    });

    const titles = (await localStore.list()).map((q) => q.title);
    expect(titles).toEqual([
      "backlog-0",
      "backlog-1",
      "done-0",
      "in_progress-0",
    ]);
  });

  it("merges updates and bumps updatedAt", async () => {
    const created = await localStore.create(draft);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T12:00:00.000Z"));

    const updated = await localStore.update(created.id, { title: "Renamed" });

    expect(updated.title).toBe("Renamed");
    expect(updated.detail).toBe(draft.detail);
    expect(updated.updatedAt).toBe("2026-09-08T12:00:00.000Z");
    expect(updated.createdAt).toBe(created.createdAt);
    expect((await localStore.list())[0]).toEqual(updated);
    vi.useRealTimers();
  });

  it("rejects updates to unknown ids", async () => {
    await expect(localStore.update("missing", { title: "x" })).rejects.toThrow(
      "Not found",
    );
  });

  it("removes a quest and keeps the rest", async () => {
    const keep = await localStore.create(draft);
    const drop = await localStore.create(draft);

    await localStore.remove(drop.id);

    const ids = (await localStore.list()).map((q) => q.id);
    expect(ids).toEqual([keep.id]);
  });

  it("persists reorders across columns", async () => {
    const a = await localStore.create(draft);
    const b = await localStore.create(draft);

    await localStore.reorder([
      { status: "backlog", ids: [b.id] },
      { status: "in_progress", ids: [a.id] },
    ]);

    const list = await localStore.list();
    expect(list.map((q) => [q.id, q.status, q.position])).toEqual([
      [b.id, "backlog", 0],
      [a.id, "in_progress", 0],
    ]);
    expect(JSON.parse(storage.raw() ?? "[]")).toHaveLength(2);
  });

  it("is a no-op without a window", async () => {
    vi.stubGlobal("window", undefined);
    expect(await localStore.list()).toEqual([]);
    await expect(localStore.remove("anything")).resolves.toBeUndefined();
  });
});

describe("apiStore", () => {
  const fetchMock = vi.fn();

  function respond(status: number, body: unknown) {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  function lastRequest() {
    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit?];
    return { url, init };
  }

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists quests without caching", async () => {
    respond(200, { quests: [{ id: "q1" }] });

    const quests = await apiStore.list();

    expect(quests).toEqual([{ id: "q1" }]);
    expect(lastRequest()).toEqual({
      url: "/api/quests",
      init: { cache: "no-store" },
    });
  });

  it("posts the draft as JSON on create", async () => {
    respond(201, { quest: { id: "q1", ...draft } });

    const quest = await apiStore.create(draft);

    expect(quest.id).toBe("q1");
    const { url, init } = lastRequest();
    expect(url).toBe("/api/quests");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual(draft);
  });

  it("patches, deletes and reorders against the right routes", async () => {
    respond(200, { quest: { id: "q1", title: "Renamed" } });
    await apiStore.update("q1", { title: "Renamed" });
    expect(lastRequest().url).toBe("/api/quests/q1");
    expect(lastRequest().init?.method).toBe("PATCH");

    respond(200, { ok: true });
    await apiStore.remove("q1");
    expect(lastRequest().url).toBe("/api/quests/q1");
    expect(lastRequest().init?.method).toBe("DELETE");

    respond(200, { ok: true });
    const groups = [{ status: "done" as const, ids: ["q1"] }];
    await apiStore.reorder(groups);
    expect(lastRequest().url).toBe("/api/quests/reorder");
    expect(JSON.parse(String(lastRequest().init?.body))).toEqual({ groups });
  });

  it("turns validation issues into per-field messages", async () => {
    respond(400, {
      error: "Invalid request",
      issues: [
        { code: "too_small", minimum: 1, path: ["title"] },
        { code: "too_big", maximum: 8, origin: "array", path: ["tags"] },
      ],
    });

    const err = await apiStore.create(draft).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    const apiErr = err as ApiError;
    expect(apiErr.status).toBe(400);
    expect(apiErr.messages).toEqual([
      "Title is required.",
      "Too many tags (max 8).",
    ]);
    expect(apiErr.message).toBe("Title is required.");
  });

  it("falls back to the error string, then to the status", async () => {
    respond(401, { error: "Unauthorized" });
    await expect(apiStore.list()).rejects.toMatchObject({
      status: 401,
      messages: ["Unauthorized"],
    });

    fetchMock.mockResolvedValueOnce(new Response("", { status: 502 }));
    await expect(apiStore.list()).rejects.toMatchObject({
      status: 502,
      messages: ["Request failed (502)."],
    });
  });
});
