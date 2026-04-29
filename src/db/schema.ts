import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const itemStatus = pgEnum("item_status", [
  "backlog",
  "in_progress",
  "done",
]);

export const items = pgTable(
  "items",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().notNull(),
    status: itemStatus().notNull().default("backlog"),
    position: integer().notNull().default(0),
    title: text().notNull(),
    dueAt: timestamp({ withTimezone: true }),
    tags: text().array().notNull().default([]),
    detail: text().notNull().default(""),
    note: text().notNull().default(""),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("items_user_status_position_idx").on(t.userId, t.status, t.position)],
);

export type DbItem = typeof items.$inferSelect;
export type DbItemInsert = typeof items.$inferInsert;
