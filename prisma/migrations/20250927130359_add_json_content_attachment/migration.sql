/*
  Warnings:

  - You are about to drop the column `body` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `contents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "body",
DROP COLUMN "url",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "content_json" JSONB,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "excerpt" TEXT;
