/*
  Warnings:

  - A unique constraint covering the columns `[quiz_id,child_id]` on the table `progress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "progress_quiz_id_child_id_key" ON "public"."progress"("quiz_id", "child_id");
