/*
  Warnings:

  - A unique constraint covering the columns `[oauth_type,oauth_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_oauth_type_oauth_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "User_oauth_type_oauth_id_key" ON "User"("oauth_type", "oauth_id");
