/*
  Warnings:

  - You are about to drop the column `createdId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "createdId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
