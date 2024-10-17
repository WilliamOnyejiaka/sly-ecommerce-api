/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `Vendor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(15) NOT NULL,
    `lastName` VARCHAR(15) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `active` BOOLEAN NOT NULL,
    `isOauth` BOOLEAN NOT NULL DEFAULT false,
    `oAuthDetails` VARCHAR(191) NULL,
    `businessName` VARCHAR(25) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phoneNumber` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vendor_email_key`(`email`),
    UNIQUE INDEX `Vendor_businessName_key`(`businessName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
