CREATE TYPE "public"."item_status" AS ENUM('backlog', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "item_status" DEFAULT 'backlog' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"due_at" timestamp with time zone,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "items_user_status_position_idx" ON "items" USING btree ("user_id","status","position");