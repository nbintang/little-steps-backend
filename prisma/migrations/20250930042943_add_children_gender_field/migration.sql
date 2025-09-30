/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `target_age_max` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `target_age_min` on the `quizzes` table. All the data in the column will be lost.
  - Added the required column `gender` to the `child_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionJson` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ChildGender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "public"."answers" DROP COLUMN "is_deleted",
ADD COLUMN     "image_answer" TEXT;

-- AlterTable
ALTER TABLE "public"."child_profiles" ADD COLUMN     "gender" "public"."ChildGender" NOT NULL;

-- AlterTable
ALTER TABLE "public"."questions" DROP COLUMN "is_deleted",
DROP COLUMN "text",
ADD COLUMN     "questionJson" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."quizzes" DROP COLUMN "is_deleted",
DROP COLUMN "target_age_max",
DROP COLUMN "target_age_min";
