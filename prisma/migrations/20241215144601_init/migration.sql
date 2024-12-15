/*
  Warnings:

  - You are about to drop the column `country` on the `CustomerAddress` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `CustomerAddress` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CustomerAddress` DROP COLUMN `country`,
    DROP COLUMN `state`;
