import { Router, Request, Response } from "express";
import { Store } from "../controllers";
import { bannerUploads, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const store: Router = Router();

store.post("/create-store", validateBody([
    'name',
    'address',
]), asyncHandler(Store.createStore));

store.post(
    "/upload-logo/:storeId",
    uploads.single("logo"),
    asyncHandler(Store.uploadStoreLogo)
);

store.post(
    "/upload-banners/:storeId",
    bannerUploads.any(),
    asyncHandler(Store.uploadBanners)
);

export default store;