-- CreateTable
CREATE TABLE `AdBanner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `cta` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AdBanner_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdBannerImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mimeType` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `adBannerId` INTEGER NOT NULL,

    UNIQUE INDEX `AdBannerImage_adBannerId_key`(`adBannerId`),
    INDEX `AdBannerImage_adBannerId_idx`(`adBannerId`),
    INDEX `AdBannerImage_publicId_idx`(`publicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mimeType` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productId` INTEGER NOT NULL,

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_publicId_idx`(`publicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `discountPrice` DECIMAL(10, 2) NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `soldCount` INTEGER NOT NULL DEFAULT 0,
    `attributes` JSON NULL,
    `stock` INTEGER NOT NULL DEFAULT 1,
    `additionalInfo` JSON NULL,
    `metaData` JSON NULL,
    `averageRating` DOUBLE NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `categoryId` INTEGER NULL,
    `subcategoryId` INTEGER NULL,

    INDEX `Product_name_idx`(`name`),
    INDEX `Product_categoryId_idx`(`categoryId`),
    INDEX `Product_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `soldCount` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 10,
    `productId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Inventory_productId_idx`(`productId`),
    INDEX `Inventory_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Admin_email_idx` ON `Admin`(`email`);

-- CreateIndex
CREATE INDEX `Admin_phoneNumber_idx` ON `Admin`(`phoneNumber`);

-- CreateIndex
CREATE INDEX `AdminPermission_adminId_idx` ON `AdminPermission`(`adminId`);

-- CreateIndex
CREATE INDEX `AdminProfilePicture_publicId_idx` ON `AdminProfilePicture`(`publicId`);

-- CreateIndex
CREATE INDEX `AdminProfilePicture_adminId_idx` ON `AdminProfilePicture`(`adminId`);

-- CreateIndex
CREATE INDEX `Brand_name_idx` ON `Brand`(`name`);

-- CreateIndex
CREATE INDEX `BrandImage_publicId_idx` ON `BrandImage`(`publicId`);

-- CreateIndex
CREATE INDEX `BrandImage_brandId_idx` ON `BrandImage`(`brandId`);

-- CreateIndex
CREATE INDEX `Category_name_idx` ON `Category`(`name`);

-- CreateIndex
CREATE INDEX `CategoryImage_publicId_idx` ON `CategoryImage`(`publicId`);

-- CreateIndex
CREATE INDEX `CategoryImage_categoryId_idx` ON `CategoryImage`(`categoryId`);

-- CreateIndex
CREATE INDEX `Customer_email_idx` ON `Customer`(`email`);

-- CreateIndex
CREATE INDEX `Customer_phoneNumber_idx` ON `Customer`(`phoneNumber`);

-- CreateIndex
CREATE INDEX `CustomerAddress_customerId_idx` ON `CustomerAddress`(`customerId`);

-- CreateIndex
CREATE INDEX `CustomerProfilePic_publicId_idx` ON `CustomerProfilePic`(`publicId`);

-- CreateIndex
CREATE INDEX `CustomerProfilePic_customerId_idx` ON `CustomerProfilePic`(`customerId`);

-- CreateIndex
CREATE INDEX `FirstStoreBanner_publicId_idx` ON `FirstStoreBanner`(`publicId`);

-- CreateIndex
CREATE INDEX `FirstStoreBanner_storeId_idx` ON `FirstStoreBanner`(`storeId`);

-- CreateIndex
CREATE INDEX `Permission_name_idx` ON `Permission`(`name`);

-- CreateIndex
CREATE INDEX `Role_name_idx` ON `Role`(`name`);

-- CreateIndex
CREATE INDEX `RolePermission_roleId_idx` ON `RolePermission`(`roleId`);

-- CreateIndex
CREATE INDEX `SecondStoreBanner_storeId_idx` ON `SecondStoreBanner`(`storeId`);

-- CreateIndex
CREATE INDEX `SecondStoreBanner_publicId_idx` ON `SecondStoreBanner`(`publicId`);

-- CreateIndex
CREATE INDEX `StoreDetails_name_idx` ON `StoreDetails`(`name`);

-- CreateIndex
CREATE INDEX `StoreDetails_vendorId_idx` ON `StoreDetails`(`vendorId`);

-- CreateIndex
CREATE INDEX `StoreLogo_publicId_idx` ON `StoreLogo`(`publicId`);

-- CreateIndex
CREATE INDEX `StoreLogo_storeId_idx` ON `StoreLogo`(`storeId`);

-- CreateIndex
CREATE INDEX `SubCategory_name_idx` ON `SubCategory`(`name`);

-- CreateIndex
CREATE INDEX `SubCategoryImage_publicId_idx` ON `SubCategoryImage`(`publicId`);

-- CreateIndex
CREATE INDEX `SubCategoryImage_subCategoryId_idx` ON `SubCategoryImage`(`subCategoryId`);

-- CreateIndex
CREATE INDEX `SubSubCategory_name_idx` ON `SubSubCategory`(`name`);

-- CreateIndex
CREATE INDEX `SubSubCategoryImage_publicId_idx` ON `SubSubCategoryImage`(`publicId`);

-- CreateIndex
CREATE INDEX `SubSubCategoryImage_subSubCategoryId_idx` ON `SubSubCategoryImage`(`subSubCategoryId`);

-- CreateIndex
CREATE INDEX `Vendor_email_idx` ON `Vendor`(`email`);

-- CreateIndex
CREATE INDEX `Vendor_phoneNumber_idx` ON `Vendor`(`phoneNumber`);

-- CreateIndex
CREATE INDEX `VendorProfilePicture_publicId_idx` ON `VendorProfilePicture`(`publicId`);

-- CreateIndex
CREATE INDEX `VendorProfilePicture_vendorId_idx` ON `VendorProfilePicture`(`vendorId`);

-- AddForeignKey
ALTER TABLE `AdBannerImage` ADD CONSTRAINT `AdBannerImage_adBannerId_fkey` FOREIGN KEY (`adBannerId`) REFERENCES `AdBanner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `SubCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `StoreDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Admin` RENAME INDEX `Admin_roleId_fkey` TO `Admin_roleId_idx`;

-- RenameIndex
ALTER TABLE `AdminPermission` RENAME INDEX `AdminPermission_permissionId_fkey` TO `AdminPermission_permissionId_idx`;

-- RenameIndex
ALTER TABLE `Category` RENAME INDEX `Category_adminId_fkey` TO `Category_adminId_idx`;

-- RenameIndex
ALTER TABLE `RolePermission` RENAME INDEX `RolePermission_permissionId_fkey` TO `RolePermission_permissionId_idx`;

-- RenameIndex
ALTER TABLE `SubCategory` RENAME INDEX `SubCategory_categoryId_fkey` TO `SubCategory_categoryId_idx`;

-- RenameIndex
ALTER TABLE `SubSubCategory` RENAME INDEX `SubSubCategory_subCategoryId_fkey` TO `SubSubCategory_subCategoryId_idx`;
