import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentUserId,
  selectWhere,
  selectHolders,
  selectOrderBy,
  selectColumn,
  insertValues,
  insertReturning,
  updateReturning,
  updateSet,
  deleteReturning,
  dbExecute,
} = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectHolders = vi.fn();
  const selectOrderBy = vi.fn();
  const selectColumn = vi.fn();
  const updateSet = vi.fn();
  const insertValues = vi.fn();
  const insertReturning = vi.fn();
  const updateReturning = vi.fn();
  const deleteReturning = vi.fn();
  const dbExecute = vi.fn();

  return {
    getCurrentUserId: vi.fn(),
    selectWhere,
    selectHolders,
    selectOrderBy,
    selectColumn,
    updateSet,
    insertValues,
    insertReturning,
    updateReturning,
    deleteReturning,
    dbExecute,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUserId,
}));

vi.mock("@/db/client", () => ({
  db: {
    select: vi.fn((arg?: unknown) => {
      if (arg && typeof arg === "object" && "maxPos" in (arg as object)) {
        return {
          from: () => ({
            where: selectWhere,
          }),
        };
      }
      if (arg && typeof arg === "object" && "position" in (arg as object)) {
        return {
          from: () => ({
            where: selectColumn,
          }),
        };
      }
      if (arg && typeof arg === "object" && "userId" in (arg as object)) {
        return {
          from: () => ({
            where: selectHolders,
          }),
        };
      }
      return {
        from: () => ({
          where: () => ({
            orderBy: selectOrderBy,
          }),
        }),
      };
    }),
    insert: vi.fn(() => ({
      values: (rows: unknown) => {
        insertValues(rows);
        return {
          returning: insertReturning,
          onConflictDoNothing: () => ({ returning: insertReturning }),
        };
      },
    })),
    update: vi.fn(() => ({
      set: (patch: unknown) => {
        updateSet(patch);
        return {
          where: () => ({
            returning: updateReturning,
          }),
        };
      },
    })),
    delete: vi.fn(() => ({
      where: () => ({
        returning: deleteReturning,
      }),
    })),
    execute: dbExecute,
  },
}));

import { POST as movePOST } from "@/app/api/quests/[id]/move/route";
import { DELETE, PATCH } from "@/app/api/quests/[id]/route";
import { POST as importPOST } from "@/app/api/quests/import/route";
import { GET, POST } from "@/app/api/quests/route";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const QUEST_ID = "22222222-2222-4222-8222-222222222222";

function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return new Request(url, {
    method,
    headers: {
      host: "localhost:3000",
      origin: "http://localhost:3000",
      "content-type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("GET /api/quests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns only the authenticated user's quests", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const now = new Date("2026-07-10T00:00:00.000Z");
    selectOrderBy.mockResolvedValue([
      {
        id: QUEST_ID,
        userId: OWNER_ID,
        status: "backlog",
        position: 0,
        title: "Own quest",
        dueAt: null,
        tags: [],
        detail: "Detail",
        note: "",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.quests).toHaveLength(1);
    expect(body.quests[0].id).toBe(QUEST_ID);
    expect(body.quests[0].title).toBe("Own quest");
  });
});

describe("POST /api/quests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await POST(
      jsonRequest("http://localhost:3000/api/quests", "POST", {
        title: "New quest",
        status: "backlog",
        detail: "Required detail",
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 on CSRF origin mismatch", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await POST(
      jsonRequest(
        "http://localhost:3000/api/quests",
        "POST",
        {
          title: "New quest",
          status: "backlog",
          detail: "Required detail",
        },
        { origin: "https://evil.example" },
      ),
    );
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid payloads", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await POST(
      jsonRequest("http://localhost:3000/api/quests", "POST", {
        title: "New quest",
        status: "backlog",
        detail: "",
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid request");
  });

  it("creates a quest for the authenticated user", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    selectWhere.mockResolvedValue([{ maxPos: 2 }]);
    const now = new Date("2026-07-10T00:00:00.000Z");
    insertReturning.mockResolvedValue([
      {
        id: QUEST_ID,
        userId: OWNER_ID,
        status: "backlog",
        position: 3,
        title: "New quest",
        dueAt: null,
        tags: [],
        detail: "Required detail",
        note: "",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const response = await POST(
      jsonRequest("http://localhost:3000/api/quests", "POST", {
        title: "New quest",
        status: "backlog",
        detail: "Required detail",
      }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.quest.id).toBe(QUEST_ID);
  });
});

describe("PATCH /api/quests/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await PATCH(
      jsonRequest(`http://localhost:3000/api/quests/${QUEST_ID}`, "PATCH", {
        title: "Nope",
      }),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 on CSRF origin mismatch", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await PATCH(
      jsonRequest(
        `http://localhost:3000/api/quests/${QUEST_ID}`,
        "PATCH",
        { title: "Nope" },
        { origin: "https://evil.example" },
      ),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid payloads", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await PATCH(
      jsonRequest(`http://localhost:3000/api/quests/${QUEST_ID}`, "PATCH", {
        detail: "",
      }),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when the quest is missing or owned by someone else", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    updateReturning.mockResolvedValue([]);

    const response = await PATCH(
      jsonRequest(`http://localhost:3000/api/quests/${QUEST_ID}`, "PATCH", {
        title: "Stolen rename",
      }),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });
});

describe("PATCH /api/quests/[id] column changes", () => {
  const url = `http://localhost:3000/api/quests/${QUEST_ID}`;
  const ctx = { params: Promise.resolve({ id: QUEST_ID }) };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    updateReturning.mockResolvedValue([]);
  });

  it("sends a quest edited into another column to the bottom of it", async () => {
    await PATCH(jsonRequest(url, "PATCH", { status: "done" }), ctx);
    const patch = updateSet.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(patch.status).toBe("done");
    const { sql } = new PgDialect().sqlToQuery(patch.position as SQL);
    expect(sql).toContain("MAX(q.position)");
  });

  it("leaves the position alone when the column isn't part of the edit", async () => {
    await PATCH(jsonRequest(url, "PATCH", { title: "Renamed" }), ctx);
    const patch = updateSet.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(patch).not.toHaveProperty("position");
  });
});

describe("DELETE /api/quests/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await DELETE(
      jsonRequest(`http://localhost:3000/api/quests/${QUEST_ID}`, "DELETE"),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );
    expect(response.status).toBe(401);
  });

  it("returns 404 when the quest is missing or owned by someone else", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    deleteReturning.mockResolvedValue([]);

    const response = await DELETE(
      jsonRequest(`http://localhost:3000/api/quests/${QUEST_ID}`, "DELETE"),
      { params: Promise.resolve({ id: QUEST_ID }) },
    );

    expect(response.status).toBe(404);
  });
});

describe("POST /api/quests/[id]/move", () => {
  const URL = `http://localhost:3000/api/quests/${QUEST_ID}/move`;
  const ctx = { params: Promise.resolve({ id: QUEST_ID }) };
  const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const body = { status: "backlog", afterId: A, beforeId: B };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await movePOST(jsonRequest(URL, "POST", body), ctx);
    expect(response.status).toBe(401);
  });

  it("returns 403 on CSRF origin mismatch", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await movePOST(
      jsonRequest(URL, "POST", body, { origin: "https://evil.example" }),
      ctx,
    );
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid payloads and 404 for a bad id", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const bad = await movePOST(
      jsonRequest(URL, "POST", { ...body, afterId: "not-a-uuid" }),
      ctx,
    );
    expect(bad.status).toBe(400);
    const missing = await movePOST(jsonRequest(URL, "POST", body), {
      params: Promise.resolve({ id: "nope" }),
    });
    expect(missing.status).toBe(404);
  });

  it("returns 404 without writing when the quest isn't the user's", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    selectColumn.mockResolvedValue([
      { id: A, position: 0 },
      { id: B, position: 1 },
    ]);
    const response = await movePOST(jsonRequest(URL, "POST", body), ctx);
    expect(response.status).toBe(404);
    expect(dbExecute).not.toHaveBeenCalled();
  });

  it("writes the moved quest and the ones it pushed down, scoped to the user", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    selectColumn.mockResolvedValue([
      { id: QUEST_ID, position: 7 },
      { id: A, position: 0 },
      { id: B, position: 1 },
    ]);
    dbExecute.mockResolvedValue([]);

    const response = await movePOST(jsonRequest(URL, "POST", body), ctx);

    expect(response.status).toBe(200);
    expect(dbExecute).toHaveBeenCalledOnce();
    const serialized = JSON.stringify(dbExecute.mock.calls[0]?.[0]);
    expect(serialized).toContain(OWNER_ID);
    expect(serialized).toContain(QUEST_ID);
    expect(serialized).toContain(B);
    expect(serialized).not.toContain(A);
  });
});

describe("POST /api/quests/import", () => {
  const URL = "http://localhost:3000/api/quests/import";
  const MINE = "33333333-3333-4333-8333-333333333333";
  const THEIRS = "44444444-4444-4444-8444-444444444444";
  const FRESH = "55555555-5555-4555-8555-555555555555";
  const SOMEONE_ELSE = "99999999-9999-4999-8999-999999999999";
  const quest = (id: string) => ({
    id,
    title: "From this browser",
    status: "backlog",
    detail: "Brought along",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserId.mockResolvedValue(null);
    const response = await importPOST(
      jsonRequest(URL, "POST", { quests: [quest(FRESH)] }),
    );
    expect(response.status).toBe(401);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("returns 403 on CSRF origin mismatch", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await importPOST(
      jsonRequest(
        URL,
        "POST",
        { quests: [quest(FRESH)] },
        { origin: "https://evil.example" },
      ),
    );
    expect(response.status).toBe(403);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payloads", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    const response = await importPOST(
      jsonRequest(URL, "POST", { quests: [quest(FRESH), quest(FRESH)] }),
    );
    expect(response.status).toBe(400);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("adds new quests for the user, skips theirs, and re-ids someone else's", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    selectHolders.mockResolvedValue([
      { id: MINE, userId: OWNER_ID },
      { id: THEIRS, userId: SOMEONE_ELSE },
    ]);
    selectWhere.mockResolvedValue([{ maxPos: 4 }]);
    insertReturning.mockImplementation(
      async () => insertValues.mock.calls[0][0],
    );

    const response = await importPOST(
      jsonRequest(URL, "POST", {
        quests: [quest(MINE), quest(THEIRS), quest(FRESH)],
      }),
    );
    expect(response.status).toBe(200);

    const rows = insertValues.mock.calls[0][0] as Array<{
      id: string;
      userId: string;
      position: number;
    }>;
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.userId === OWNER_ID)).toBe(true);
    expect(rows.map((r) => r.position)).toEqual([5, 6]);
    expect(rows[0].id).not.toBe(THEIRS);
    expect(rows[1].id).toBe(FRESH);

    const body = await response.json();
    expect(body.alreadyHere).toEqual([MINE]);
    expect(
      body.added.map((a: { from: string; quest: { id: string } }) => [
        a.from,
        a.quest.id,
      ]),
    ).toEqual([
      [THEIRS, rows[0].id],
      [FRESH, FRESH],
    ]);
  });

  it("skips the insert when everything is already there", async () => {
    getCurrentUserId.mockResolvedValue(OWNER_ID);
    selectHolders.mockResolvedValue([{ id: MINE, userId: OWNER_ID }]);
    selectWhere.mockResolvedValue([{ maxPos: null }]);

    const response = await importPOST(
      jsonRequest(URL, "POST", { quests: [quest(MINE)] }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      added: [],
      alreadyHere: [MINE],
    });
    expect(insertValues).not.toHaveBeenCalled();
  });
});
