/*
  Warnings:

  - You are about to drop the `NewFollower` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewProductInbox` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `NewFollower` DROP FOREIGN KEY `NewFollower_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `NewFollower` DROP FOREIGN KEY `NewFollower_storeId_fkey`;

-- DropForeignKey
ALTER TABLE `NewProductInbox` DROP FOREIGN KEY `NewProductInbox_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `NewProductInbox` DROP FOREIGN KEY `NewProductInbox_productId_fkey`;

-- DropForeignKey
ALTER TABLE `NewProductInbox` DROP FOREIGN KEY `NewProductInbox_storeId_fkey`;

-- DropTable
DROP TABLE `NewFollower`;

-- DropTable
DROP TABLE `NewProductInbox`;

-- CreateIndex
CREATE INDEX `StoreFollower_storeId_idx` ON `StoreFollower`(`storeId`);

-- RenameIndex
ALTER TABLE `StoreFollower` RENAME INDEX `StoreFollower_customerId_fkey` TO `StoreFollower_customerId_idx`;
