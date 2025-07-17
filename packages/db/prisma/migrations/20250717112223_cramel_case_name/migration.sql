/*
  Warnings:

  - You are about to drop the column `repo_url` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `installation_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oauth_type` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[oauthType,oauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `repoUrl` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatarUrl` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oauthId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oauthType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_oauth_type_oauth_id_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repo_url",
ADD COLUMN     "repoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_url",
DROP COLUMN "installation_id",
DROP COLUMN "oauth_id",
DROP COLUMN "oauth_type",
ADD COLUMN     "avatarUrl" TEXT NOT NULL,
ADD COLUMN     "installationId" TEXT,
ADD COLUMN     "oauthId" TEXT NOT NULL,
ADD COLUMN     "oauthType" "Oauth_Type" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_oauthType_oauthId_key" ON "User"("oauthType", "oauthId");
