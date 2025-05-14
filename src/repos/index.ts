import { PrismaClient } from "@prisma/client";
import Vendor from "./Vendor";
import VendorProfilePicture from "./VendorProfilePicture";
import StoreDetails from "./StoreDetails";
import StoreLogo from "./StoreLogo";
import Admin from "./Admin";
import AdminProfilePicture from "./AdminProfilePicture";
import Role from "./Role";
import Permission from "./Permission";
import AdminPermission from "./AdminPermission";
import Category from "./Category";
import Customer from "./Customer";
import Brand from "./Brand";
import CustomerProfilePic from "./CustomerProfilePic";
import SecondBanner from "./SecondBanner";
import FirstBanner from "./FirstBanner";
import SubCategory from "./SubCategory";
import SubCategoryImage from "./SubCategoryImage";
import CategoryImage from "./CategoryImage";
import AdBanner from "./AdBanner";
import AdBannerImage from "./AdBannerImage";
import CommentLike from "./CommentLike";
import ProductComment from "./ProductComment";
import StoreFollower from "./StoreFollower";
import Product from "./Product";
import NewProductInbox from "./NewProductInbox";
import NewFollower from "./NewFollower";
import SavedProduct from "./SavedProduct";
import FavoriteStore from "./FavoriteStore";
import ProductRating from "./ProductRating";
import StoreRating from "./StoreRating";
import ProductLike from "./ProductLike";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Vendor,
    VendorProfilePicture,
    StoreDetails,
    StoreLogo,
    Admin,
    AdminProfilePicture,
    Role,
    Permission,
    AdminPermission,
    Category,
    CategoryImage,
    Brand,
    Customer,
    CustomerProfilePic,
    SecondBanner,
    FirstBanner,
    SubCategory,
    SubCategoryImage,
    AdBanner,
    CommentLike,
    ProductComment,
    AdBannerImage,
    StoreFollower,
    Product,
    NewProductInbox,
    NewFollower,
    SavedProduct,
    FavoriteStore,
    ProductRating,
    StoreRating,
    ProductLike
};
