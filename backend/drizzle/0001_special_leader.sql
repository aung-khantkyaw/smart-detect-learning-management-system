CREATE TYPE "public"."assignment_question_type" AS ENUM('TEXT', 'PDF');--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD COLUMN "score" numeric;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "question_type" "assignment_question_type" DEFAULT 'TEXT' NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "question_text" text;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "question_file_url" text;--> statement-breakpoint
ALTER TABLE "assignment_submissions" DROP COLUMN "file_url";--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_enforce_ai_policy_update ON assignment_submissions CASCADE;--> statement-breakpoint
ALTER TABLE "assignment_submissions" DROP COLUMN "ai_score";