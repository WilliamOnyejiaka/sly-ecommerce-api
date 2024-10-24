/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `StoreDetails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `StoreDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VendorProfilePicture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StoreDetails` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `VendorProfilePicture` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `StoreDetails_name_key` ON `StoreDetails`(`name`);
