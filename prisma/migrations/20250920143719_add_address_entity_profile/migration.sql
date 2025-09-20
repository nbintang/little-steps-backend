/*
  Warnings:

  - You are about to drop the column `address` on the `profile` table. All the data in the column will be lost.
  - Added the required column `phone_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."profile" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "phone_number" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addresses_profile_id_key" ON "public"."addresses"("profile_id");

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
