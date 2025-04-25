-- CreateTable
CREATE TABLE `FavoriteSore` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FavoriteSore_storeId_customerId_key`(`storeId`, `customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriteSore` ADD CONSTRAINT `FavoriteSore_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteSore` ADD CONSTRAINT `FavoriteSore_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
