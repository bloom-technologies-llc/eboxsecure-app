/*
  Warnings:

  - Added the required column `invitedById` to the `PendingAdminAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PendingAdminAccountStatus" AS ENUM ('PENDING', 'REVOKED');

-- AlterTable
ALTER TABLE "PendingAdminAccount" ADD COLUMN     "employeeRole" "EmployeeRole",
ADD COLUMN     "invitedById" TEXT NOT NULL,
ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "status" "PendingAdminAccountStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "PendingAdminAccount" ADD CONSTRAINT "PendingAdminAccount_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingAdminAccount" ADD CONSTRAINT "PendingAdminAccount_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
