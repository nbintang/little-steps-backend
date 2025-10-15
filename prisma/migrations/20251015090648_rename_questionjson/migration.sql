/*
  Warnings:

  - You are about to drop the column `questionJson` on the `questions` table. All the data in the column will be lost.
  - Added the required column `question_json` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."questions" DROP COLUMN "questionJson",
ADD COLUMN     "question_json" JSONB NOT NULL;
