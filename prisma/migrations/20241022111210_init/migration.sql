/*
  Warnings:

  - A unique constraint covering the columns `[businessName]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `businessName` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Vendor` MODIFY `businessName` VARCHAR(25) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Vendor_businessName_key` ON `Vendor`(`businessName`);
