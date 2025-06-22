/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[oauth_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatar_url` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oauth_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oauth_type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Oauth_Type" AS ENUM ('GIHTUB');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "avatar_url" TEXT NOT NULL,
ADD COLUMN     "oauth_id" TEXT NOT NULL,
ADD COLUMN     "oauth_type" "Oauth_Type" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_oauth_id_key" ON "User"("oauth_id");
