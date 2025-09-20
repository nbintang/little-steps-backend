-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
