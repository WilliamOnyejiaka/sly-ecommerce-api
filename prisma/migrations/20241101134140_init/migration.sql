/*
  Warnings:

  - Added the required column `createdBy` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `createdBy` VARCHAR(191) NOT NULL;
