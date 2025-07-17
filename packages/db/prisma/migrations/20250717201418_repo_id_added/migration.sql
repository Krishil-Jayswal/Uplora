/*
  Warnings:

  - Added the required column `repoId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "repoId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Project_repoId_idx" ON "Project"("repoId");
