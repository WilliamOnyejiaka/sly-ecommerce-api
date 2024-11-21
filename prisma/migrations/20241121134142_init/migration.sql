-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT false;
