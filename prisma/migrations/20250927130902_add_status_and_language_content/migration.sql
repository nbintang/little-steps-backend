-- CreateEnum
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT',  'PUBLISHED');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('ID', 'EN', 'OTHER');

-- AlterTable
ALTER TABLE "public"."contents" ADD COLUMN     "language" "public"."Language" NOT NULL DEFAULT 'ID',
ADD COLUMN     "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT';
