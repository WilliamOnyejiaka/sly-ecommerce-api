/*
  Warnings:

  - You are about to drop the column `viewed` on the `StoreRating` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,customerId]` on the table `ProductRating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,customerId]` on the table `StoreRating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `ProductRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProductRating` ADD COLUMN `productId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `StoreRating` DROP COLUMN `viewed`,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `ProductRating_productId_customerId_key` ON `ProductRating`(`productId`, `customerId`);

-- CreateIndex
CREATE UNIQUE INDEX `StoreRating_storeId_customerId_key` ON `StoreRating`(`storeId`, `customerId`);

-- AddForeignKey
ALTER TABLE `ProductRating` ADD CONSTRAINT `ProductRating_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
