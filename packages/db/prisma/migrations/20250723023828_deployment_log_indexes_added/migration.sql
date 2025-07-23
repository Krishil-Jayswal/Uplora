/*
  Warnings:

  - A unique constraint covering the columns `[repoId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'deploying';

-- DropIndex
DROP INDEX "Project_repoId_idx";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stableDeploymentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "buildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "deploymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deployment_projectId_idx" ON "Deployment"("projectId");

-- CreateIndex
CREATE INDEX "Log_deploymentId_idx" ON "Log"("deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_repoId_key" ON "Project"("repoId");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
