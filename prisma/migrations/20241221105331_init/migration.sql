/*
  Warnings:

  - You are about to alter the column `createdBy` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Admin` MODIFY `createdBy` INTEGER NOT NULL;
