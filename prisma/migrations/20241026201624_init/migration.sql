-- DropForeignKey
ALTER TABLE `AdminProfilePicture` DROP FOREIGN KEY `AdminProfilePicture_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `FirstStoreBanner` DROP FOREIGN KEY `FirstStoreBanner_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `SecondStoreBanner` DROP FOREIGN KEY `SecondStoreBanner_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `StoreDetails` DROP FOREIGN KEY `StoreDetails_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `StoreLogo` DROP FOREIGN KEY `StoreLogo_storeId_fkey`;

-- AddForeignKey
ALTER TABLE `StoreDetails` ADD CONSTRAINT `StoreDetails_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreLogo` ADD CONSTRAINT `StoreLogo_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FirstStoreBanner` ADD CONSTRAINT `FirstStoreBanner_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecondStoreBanner` ADD CONSTRAINT `SecondStoreBanner_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfilePicture` ADD CONSTRAINT `AdminProfilePicture_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
