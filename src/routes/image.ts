import asyncHandler from "express-async-handler";
import { Vendor, Store } from "../controllers";
import { Router } from "express";

const image = Router();

image.get("/vendor/profile-pic/:vendorId", asyncHandler(Vendor.getProfilePicture));
image.get("/store/store-logo/:storeId", asyncHandler(Store.getStoreLogo));

export default image;
