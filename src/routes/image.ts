import asyncHandler from "express-async-handler";
import { Vendor, Store } from "../controllers";
import { Router } from "express";
import { urls } from "../constants";

const image = Router();

image.get(urls("vendorPic")!, asyncHandler(Vendor.getProfilePicture));
image.get(urls("storeLogo")!, asyncHandler(Store.getStoreLogo));

export default image;
