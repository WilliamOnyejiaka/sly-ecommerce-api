-- DropForeignKey
ALTER TABLE `VendorProfilePicture` DROP FOREIGN KEY `VendorProfilePicture_vendorId_fkey`;

-- AddForeignKey
ALTER TABLE `VendorProfilePicture` ADD CONSTRAINT `VendorProfilePicture_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
