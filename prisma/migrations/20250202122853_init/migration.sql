-- AlterTable
ALTER TABLE `Brand` ADD COLUMN `adminId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
