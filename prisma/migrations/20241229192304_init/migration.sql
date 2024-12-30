/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Admin_phoneNumber_key` ON `Admin`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_phoneNumber_key` ON `Customer`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Vendor_phoneNumber_key` ON `Vendor`(`phoneNumber`);
