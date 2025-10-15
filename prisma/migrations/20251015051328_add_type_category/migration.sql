-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('PARENT', 'CHILD');

-- AlterTable
ALTER TABLE "public"."category" ADD COLUMN     "type" "public"."CategoryType" NOT NULL DEFAULT 'PARENT';
