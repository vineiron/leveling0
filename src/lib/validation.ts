import { z } from "zod";
import { ITEM_STATUSES, type ItemStatus } from "./items/types";

// Limits sized to realistic personal-board usage, not arbitrary ceilings.
// They guard against accidental/abusive huge payloads and keep the client
// markdown renderer fast — not against DB compute cost (text is cheap).
const TITLE_MAX = 200; // ~35 words; a title is one line
const DETAIL_MAX = 20_000; // ~15 pages of markdown; a very thorough spec
const NOTE_MAX = 10_000; // secondary scratch notes, shorter than detail
const TAG_MAX = 32; // one or two words per tag
const TAGS_MAX_COUNT = 15; // a task with >15 tags is unusual
const REORDER_MAX_IDS_PER_GROUP = 1_000; // safety ceiling; real columns are far smaller

const itemStatusSchema = z.enum(ITEM_STATUSES as [ItemStatus, ...ItemStatus[]]);

const isoDateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" });

const dueAtCreate = z
  .union([isoDateString, z.literal(""), z.null()])
  .optional()
  .transform((v) => (typeof v === "string" && v.length > 0 ? new Date(v) : null));

const dueAtUpdate = z
  .union([isoDateString, z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (typeof v === "string" && v.length > 0) return new Date(v);
    return null;
  });

const tagsSchema = z
  .array(z.string().trim().min(1).max(TAG_MAX))
  .max(TAGS_MAX_COUNT);

export const createItemSchema = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX),
    status: itemStatusSchema,
    dueAt: dueAtCreate,
    tags: tagsSchema.optional().default([]),
    detail: z
      .string()
      .max(DETAIL_MAX)
      .refine((s) => s.trim().length > 0, { message: "Detail is required" }),
    note: z.string().max(NOTE_MAX).optional().default(""),
  })
  .strict();

export const updateItemSchema = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX).optional(),
    status: itemStatusSchema.optional(),
    position: z.number().int().nonnegative().optional(),
    dueAt: dueAtUpdate,
    tags: tagsSchema.optional(),
    detail: z
      .string()
      .max(DETAIL_MAX)
      .refine((s) => s.trim().length > 0, { message: "Detail is required" })
      .optional(),
    note: z.string().max(NOTE_MAX).optional(),
  })
  .strict();

export const reorderSchema = z
  .object({
    groups: z
      .array(
        z
          .object({
            status: itemStatusSchema,
            ids: z.array(z.string().uuid()).max(REORDER_MAX_IDS_PER_GROUP),
          })
          .strict(),
      )
      .max(ITEM_STATUSES.length),
  })
  .strict()
  .refine(
    (data) => {
      const seen = new Set<string>();
      for (const g of data.groups) {
        for (const id of g.ids) {
          if (seen.has(id)) return false;
          seen.add(id);
        }
      }
      return true;
    },
    { message: "Duplicate item IDs across groups" },
  );
