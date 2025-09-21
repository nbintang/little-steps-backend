-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "accepted_terms" BOOLEAN NOT NULL DEFAULT false;
