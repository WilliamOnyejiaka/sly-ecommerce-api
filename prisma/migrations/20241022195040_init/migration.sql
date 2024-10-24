/*
  Warnings:

  - You are about to drop the `VendorPofilePicture` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `VendorPofilePicture` DROP FOREIGN KEY `VendorPofilePicture_vendorId_fkey`;

-- DropTable
DROP TABLE `VendorPofilePicture`;

-- CreateTable
CREATE TABLE `VendorProfilePicture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mimeType` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NOT NULL,
    `vendorId` INTEGER NOT NULL,

    UNIQUE INDEX `VendorProfilePicture_vendorId_key`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VendorProfilePicture` ADD CONSTRAINT `VendorProfilePicture_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
