/*
  Warnings:

  - You are about to alter the column `excerpt` on the `contents` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.

*/
-- AlterTable
ALTER TABLE "public"."contents" ALTER COLUMN "excerpt" SET DATA TYPE VARCHAR(300);
