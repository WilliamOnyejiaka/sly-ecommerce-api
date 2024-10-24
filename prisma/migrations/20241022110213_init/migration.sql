-- DropIndex
DROP INDEX `Vendor_businessName_key` ON `Vendor`;

-- AlterTable
ALTER TABLE `Vendor` MODIFY `businessName` VARCHAR(25) NULL;
