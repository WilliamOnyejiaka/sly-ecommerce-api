/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `StoreLogo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `draft` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `link` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StoreLogo` DROP COLUMN `imageUrl`;
