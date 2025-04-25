/*
  Warnings:

  - You are about to drop the `FavoriteSore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `FavoriteSore` DROP FOREIGN KEY `FavoriteSore_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriteSore` DROP FOREIGN KEY `FavoriteSore_storeId_fkey`;

-- DropTable
DROP TABLE `FavoriteSore`;

-- CreateTable
CREATE TABLE `FavoriteStore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FavoriteStore_storeId_customerId_key`(`storeId`, `customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriteStore` ADD CONSTRAINT `FavoriteStore_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteStore` ADD CONSTRAINT `FavoriteStore_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewFollower` ADD CONSTRAINT `NewFollower_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
