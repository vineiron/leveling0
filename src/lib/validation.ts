import { z } from "zod";
import { IMPORT_MAX_QUESTS, QUEST_LIMITS } from "./quests/limits";
import { QUEST_STATUSES, type QuestStatus } from "./quests/types";

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
  .array(z.string().trim().min(1).max(QUEST_LIMITS.tag))
  .max(QUEST_LIMITS.tags);

export const questIdSchema = z.string().uuid();

export const createQuestSchema = z
  .object({
    title: z.string().trim().min(1).max(QUEST_LIMITS.title),
    status: questStatusSchema,
    dueAt: dueAtCreate,
    tags: tagsSchema.optional().default([]),
    detail: z
      .string()
      .max(QUEST_LIMITS.detail)
      .refine((s) => s.trim().length > 0, { message: "Detail is required" }),
    note: z.string().max(QUEST_LIMITS.note).optional().default(""),
  })
  .strict();

export const updateQuestSchema = z
  .object({
    title: z.string().trim().min(1).max(QUEST_LIMITS.title).optional(),
    status: questStatusSchema.optional(),
    position: z.number().int().nonnegative().optional(),
    dueAt: dueAtUpdate,
    tags: tagsSchema.optional(),
    detail: z
      .string()
      .max(QUEST_LIMITS.detail)
      .refine((s) => s.trim().length > 0, { message: "Detail is required" })
      .optional(),
    note: z.string().max(QUEST_LIMITS.note).optional(),
  })
  .strict();

export const moveQuestSchema = z
  .object({
    status: questStatusSchema,
    afterId: questIdSchema.nullable(),
    beforeId: questIdSchema.nullable(),
  })
  .strict();

const importedAt = isoDateString.transform((s) => new Date(s)).optional();

export const importedQuestSchema = createQuestSchema
  .extend({
    id: questIdSchema,
    createdAt: importedAt,
    updatedAt: importedAt,
  })
  .strict();

export const importQuestsSchema = z
  .object({
    quests: z.array(importedQuestSchema).min(1).max(IMPORT_MAX_QUESTS),
  })
  .strict()
  .refine(
    (data) => new Set(data.quests.map((q) => q.id)).size === data.quests.length,
    { message: "Duplicate quest IDs" },
  );

export type ImportQuest = z.output<typeof importedQuestSchema>;
