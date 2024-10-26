import { PrismaClient } from "@prisma/client";
import Vendor from "./Vendor";
import VendorProfilePicture from "./VendorProfilePicture";
import StoreDetails from "./StoreDetails";
import StoreLogo from "./StoreLogo";
import Banner from "./Banner";
import Admin from "./Admin";

const prisma: PrismaClient = new PrismaClient();

export default prisma;
export { Vendor, VendorProfilePicture, StoreDetails, StoreLogo, Banner, Admin };
