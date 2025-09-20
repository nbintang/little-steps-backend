/*
  Warnings:

  - The values [QUIZ] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContentType_new" AS ENUM ('ARTICLE', 'FICTION_STORY');
ALTER TABLE "public"."contents" ALTER COLUMN "type" TYPE "public"."ContentType_new" USING ("type"::text::"public"."ContentType_new");
ALTER TYPE "public"."ContentType" RENAME TO "ContentType_old";
ALTER TYPE "public"."ContentType_new" RENAME TO "ContentType";
DROP TYPE "public"."ContentType_old";
COMMIT;
