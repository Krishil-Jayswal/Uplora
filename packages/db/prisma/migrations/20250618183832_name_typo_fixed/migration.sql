/*
  Warnings:

  - The values [GIHTUB] on the enum `Oauth_Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Oauth_Type_new" AS ENUM ('GITHUB');
ALTER TABLE "User" ALTER COLUMN "oauth_type" TYPE "Oauth_Type_new" USING ("oauth_type"::text::"Oauth_Type_new");
ALTER TYPE "Oauth_Type" RENAME TO "Oauth_Type_old";
ALTER TYPE "Oauth_Type_new" RENAME TO "Oauth_Type";
DROP TYPE "Oauth_Type_old";
COMMIT;
