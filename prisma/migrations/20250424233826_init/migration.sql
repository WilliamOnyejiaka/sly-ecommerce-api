-- DropForeignKey
ALTER TABLE `NewFollower` DROP FOREIGN KEY `NewFollower_storeId_fkey`;

-- DropIndex
DROP INDEX `NewFollower_storeId_customerId_key` ON `NewFollower`;

-- -- AddForeignKey
-- ALTER TABLE `Brand` ADD CONSTRAINT `Brand_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
