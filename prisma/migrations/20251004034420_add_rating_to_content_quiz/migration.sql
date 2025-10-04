-- AlterTable
ALTER TABLE "public"."contents" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."quizzes" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0;
