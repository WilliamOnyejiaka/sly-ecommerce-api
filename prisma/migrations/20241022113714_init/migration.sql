/*
  Warnings:

  - You are about to drop the column `businessName` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Vendor_businessName_key` ON `Vendor`;

-- AlterTable
ALTER TABLE `Vendor` DROP COLUMN `businessName`;
