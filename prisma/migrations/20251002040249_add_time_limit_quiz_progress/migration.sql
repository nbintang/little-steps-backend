/*
  Warnings:

  - You are about to drop the column `content_id` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `progress` table. All the data in the column will be lost.
  - Made the column `quiz_id` on table `progress` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."progress" DROP CONSTRAINT "progress_content_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."progress" DROP CONSTRAINT "progress_quiz_id_fkey";

-- AlterTable
ALTER TABLE "public"."progress" DROP COLUMN "content_id",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "submitted_at" TIMESTAMP(3),
ALTER COLUMN "quiz_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."quizzes" ADD COLUMN     "time_limit" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."progress" ADD CONSTRAINT "progress_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
