/*
  Warnings:

  - Added the required column `city` to the `StoreDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `StoreDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagLine` to the `StoreDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StoreDetails` ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `tagLine` VARCHAR(191) NOT NULL;
