/*
  Warnings:

  - You are about to drop the column `attachments` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `target_age_max` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `target_age_min` on the `contents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "attachments",
DROP COLUMN "coverImage",
DROP COLUMN "is_deleted",
DROP COLUMN "is_published",
DROP COLUMN "language",
DROP COLUMN "target_age_max",
DROP COLUMN "target_age_min",
ADD COLUMN     "cover_image" TEXT;

-- DropEnum
DROP TYPE "public"."Language";
