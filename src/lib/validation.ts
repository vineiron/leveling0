import { z } from "zod";
import { QUEST_STATUSES, type QuestStatus } from "./quests/types";

const TITLE_MAX = 200;
const DETAIL_MAX = 20_000;
const NOTE_MAX = 10_000;
const TAG_MAX = 32;
const TAGS_MAX_COUNT = 15;
const REORDER_MAX_IDS_PER_GROUP = 1_000;

const questStatusSchema = z.enum(
  QUEST_STATUSES as [QuestStatus, ...QuestStatus[]],
);

const isoDateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" });

const dueAtCreate = z
  .union([isoDateString, z.literal(""), z.null()])
  .optional()
  .transform((v) =>
    typeof v === "string" && v.length > 0 ? new Date(v) : null,
  );

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

export const questIdSchema = z.string().uuid();

export const createQuestSchema = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX),
    status: questStatusSchema,
    dueAt: dueAtCreate,
    tags: tagsSchema.optional().default([]),
    detail: z
      .string()
      .max(DETAIL_MAX)
      .refine((s) => s.trim().length > 0, { message: "Detail is required" }),
    note: z.string().max(NOTE_MAX).optional().default(""),
  })
  .strict();

export const updateQuestSchema = z
  .object({
    title: z.string().trim().min(1).max(TITLE_MAX).optional(),
    status: questStatusSchema.optional(),
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
            status: questStatusSchema,
            ids: z.array(z.string().uuid()).max(REORDER_MAX_IDS_PER_GROUP),
          })
          .strict(),
      )
      .max(QUEST_STATUSES.length),
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
    { message: "Duplicate quest IDs across groups" },
  );
