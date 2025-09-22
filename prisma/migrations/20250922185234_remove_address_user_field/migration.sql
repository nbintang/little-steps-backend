/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_profile_id_fkey";

-- AlterTable
ALTER TABLE "public"."profile" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."addresses";
