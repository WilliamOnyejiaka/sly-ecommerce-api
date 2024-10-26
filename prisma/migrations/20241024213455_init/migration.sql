-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(15) NOT NULL,
    `lastName` VARCHAR(15) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'MANAGER', 'VENDOR', 'USER', 'MODERATOR', 'SUPPORT_ADMIN', 'FINANCE_ADMIN', 'HR_ADMIN', 'IT_ADMIN', 'COMPLIANCE_ADMIN') NOT NULL DEFAULT 'MANAGER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminProfilePicture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mimeType` VARCHAR(191) NOT NULL,
    `picture` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `adminId` INTEGER NOT NULL,

    UNIQUE INDEX `AdminProfilePicture_adminId_key`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminProfilePicture` ADD CONSTRAINT `AdminProfilePicture_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
