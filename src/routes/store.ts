import { Router, Request, Response } from "express";
import { Store } from "../controllers";
import { bannerUploads, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { storeImagesUploads } from "../middlewares/multer";

const store: Router = Router();

store.post(
    "/create-store",
    validateBody([
        'name',
        'address',
        'city',
        'description',
        'tagLine'
    ]),
    asyncHandler(Store.createStore)
);

store.post("/create-vendor-store",
    storeImagesUploads.any(),
    asyncHandler(Store.createAll)
);

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

store.get("/",asyncHandler(Store.getStoreAll));

store.delete(
    "/",
    asyncHandler(Store.deleteStore)
);

export default store;