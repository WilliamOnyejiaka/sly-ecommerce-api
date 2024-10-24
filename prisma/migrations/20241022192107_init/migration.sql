/*
  Warnings:

  - Added the required column `mimeType` to the `VendorPofilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picture` to the `VendorPofilePicture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VendorPofilePicture` ADD COLUMN `mimeType` VARCHAR(191) NOT NULL,
    ADD COLUMN `picture` VARCHAR(191) NOT NULL;
