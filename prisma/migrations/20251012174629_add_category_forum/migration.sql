-- AlterTable
ALTER TABLE "public"."forum_threads" ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."forum_threads" ADD CONSTRAINT "forum_threads_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
