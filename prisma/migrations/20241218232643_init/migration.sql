/*
  Warnings:

  - You are about to drop the column `folder` on the `AdminProfilePicture` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `AdminProfilePicture` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `BrandImage` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `BrandImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `CategoryImage` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `CategoryImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `CustomerProfilePic` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `CustomerProfilePic` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `FirstStoreBanner` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `FirstStoreBanner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `SecondStoreBanner` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `SecondStoreBanner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `StoreLogo` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `StoreLogo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `SubCategoryImage` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `SubCategoryImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `SubSubCategoryImage` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `SubSubCategoryImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `folder` on the `VendorProfilePicture` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `VendorProfilePicture` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `AdminProfilePicture` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `BrandImage` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `CategoryImage` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `CustomerProfilePic` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `FirstStoreBanner` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `SecondStoreBanner` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `StoreLogo` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `SubCategoryImage` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `SubSubCategoryImage` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `VendorProfilePicture` DROP COLUMN `folder`,
    MODIFY `size` INTEGER NOT NULL;
