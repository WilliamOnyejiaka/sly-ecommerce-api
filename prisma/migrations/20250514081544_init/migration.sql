-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `isOauth` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `oAuthDetails` VARCHAR(191) NULL;
