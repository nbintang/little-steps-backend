/*
  Warnings:

  - You are about to drop the column `zipCode` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `zip_code` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."addresses" DROP COLUMN "zipCode",
ADD COLUMN     "zip_code" TEXT NOT NULL;
