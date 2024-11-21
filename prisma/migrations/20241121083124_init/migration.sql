-- DropForeignKey
ALTER TABLE `Admin` DROP FOREIGN KEY `Admin_roleId_fkey`;

-- AlterTable
ALTER TABLE `Admin` MODIFY `roleId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AdminPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    UNIQUE INDEX `AdminPermission_adminId_permissionId_key`(`adminId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminPermission` ADD CONSTRAINT `AdminPermission_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminPermission` ADD CONSTRAINT `AdminPermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
