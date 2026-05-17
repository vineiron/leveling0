ALTER TYPE "public"."item_status" RENAME TO "quest_status";--> statement-breakpoint
ALTER TABLE "items" RENAME TO "quests";--> statement-breakpoint
DROP INDEX "items_user_status_position_idx";--> statement-breakpoint
CREATE INDEX "quests_user_status_position_idx" ON "quests" USING btree ("user_id","status","position");