-- DropIndex
DROP INDEX "Project_repoId_key";

-- CreateIndex
CREATE INDEX "Project_repoId_idx" ON "Project"("repoId");
