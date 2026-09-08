ALTER TABLE "quests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "quests" FROM anon, authenticated;
