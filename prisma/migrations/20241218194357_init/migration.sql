/*
  Warnings:

  - You are about to drop the column `picture` on the `AdminProfilePicture` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `BrandImage` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `CategoryImage` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `CustomerProfilePic` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `FirstStoreBanner` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `SecondStoreBanner` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `StoreLogo` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `SubCategoryImage` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `SubSubCategoryImage` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `VendorProfilePicture` table. All the data in the column will be lost.
  - Added the required column `folder` to the `AdminProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `AdminProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `AdminProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `AdminProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `BrandImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `BrandImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `BrandImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `BrandImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `CategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `CategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `CategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `CategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `CustomerProfilePic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `CustomerProfilePic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `CustomerProfilePic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `CustomerProfilePic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `FirstStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `FirstStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `FirstStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `FirstStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `SecondStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `SecondStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `SecondStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `SecondStoreBanner` table without a default value. This is not possible if the table is not empty.
  - Made the column `mimeType` on table `SecondStoreBanner` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `folder` to the `StoreLogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `StoreLogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `StoreLogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `StoreLogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `SubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `SubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `SubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `SubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `SubSubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `SubSubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `SubSubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `SubSubCategoryImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `VendorProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `VendorProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `VendorProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `VendorProfilePicture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AdminProfilePicture` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `BrandImage` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CategoryImage` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CustomerProfilePic` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `FirstStoreBanner` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SecondStoreBanner` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL,
    MODIFY `mimeType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `StoreLogo` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SubCategoryImage` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SubSubCategoryImage` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `VendorProfilePicture` DROP COLUMN `picture`,
    ADD COLUMN `folder` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `publicId` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` VARCHAR(191) NOT NULL;
