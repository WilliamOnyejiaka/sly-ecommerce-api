import { PrismaClient } from "@prisma/client";
import Vendor from "./Vendor";
import VendorProfilePicture from "./VendorProfilePicture";
import StoreDetails from "./StoreDetails";
import StoreLogo from "./StoreLogo";
import Banner from "./Banner";
import Admin from "./Admin";
import AdminProfilePicture from "./AdminProfilePicture";
import Role from "./Role";
import Permission from "./Permission";
import AdminPermission from "./AdminPermission";
import Category from "./Category";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Vendor,
    VendorProfilePicture,
    StoreDetails,
    StoreLogo,
    Banner,
    Admin,
    AdminProfilePicture,
    Role,
    Permission,
    AdminPermission,
    Category
};
