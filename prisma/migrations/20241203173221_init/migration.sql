-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_adminId_fkey`;

-- AlterTable
ALTER TABLE `Category` MODIFY `adminId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Customer` MODIFY `active` BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
