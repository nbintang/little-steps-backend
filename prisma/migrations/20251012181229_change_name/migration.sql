/*
  Warnings:

  - You are about to drop the column `isEdited` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `isEdited` on the `forum_posts` table. All the data in the column will be lost.
  - You are about to drop the column `isEdited` on the `forum_threads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contents" DROP COLUMN "isEdited",
ADD COLUMN     "is_edited" BOOLEAN;

-- AlterTable
ALTER TABLE "public"."forum_posts" DROP COLUMN "isEdited",
ADD COLUMN     "is_edited" BOOLEAN;

-- AlterTable
ALTER TABLE "public"."forum_threads" DROP COLUMN "isEdited",
ADD COLUMN     "is_edited" BOOLEAN;
