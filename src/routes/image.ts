import asyncHandler from "express-async-handler";
import { ImageController } from "../controllers";
import { Router } from "express";
import { urls } from "../constants";

const image = Router();

image.get(urls("vendorPic")!, asyncHandler(ImageController.getVendorProfilePic()));
image.get(urls("storeLogo")!, asyncHandler(ImageController.getStoreLogo()));
image.get(urls("firstBanner")!, asyncHandler(ImageController.getFirstStoreBanner()));
image.get(urls("secondBanner")!, asyncHandler(ImageController.getSecondStoreBanner()));

export default image;
