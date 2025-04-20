-- DropForeignKey
ALTER TABLE `StoreFollower` DROP FOREIGN KEY `StoreFollower_storeId_fkey`;

-- CreateTable
CREATE TABLE `ProductComment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `userType` ENUM('VENDOR', 'CUSTOMER', 'ADMIN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `parentId` INTEGER NOT NULL,

    UNIQUE INDEX `ProductComment_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userType` ENUM('VENDOR', 'CUSTOMER', 'ADMIN') NOT NULL,
    `commentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CommentLike_userId_commentId_userType_key`(`userId`, `commentId`, `userType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userType` ENUM('VENDOR', 'CUSTOMER', 'ADMIN') NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductLike_userId_productId_userType_key`(`userId`, `productId`, `userType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StoreFollower` ADD CONSTRAINT `StoreFollower_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductComment` ADD CONSTRAINT `ProductComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ProductComment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `ProductComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
