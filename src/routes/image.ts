import asyncHandler from "express-async-handler";
import { Vendor, Store } from "../controllers";
import { Router } from "express";
import { urls } from "../constants";

const image = Router();

image.get(urls("vendorPic")!, asyncHandler(Vendor.getProfilePicture));
image.get(urls("storeLogo")!, asyncHandler(Store.getStoreLogo));
image.get(urls("firstBanner")!, asyncHandler(Store.getFirstStoreBanner));
image.get(urls("secondBanner")!, asyncHandler(Store.getSecondStoreBanner));


export default image;
