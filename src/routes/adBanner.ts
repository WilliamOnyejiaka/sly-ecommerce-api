import { Router } from "express";
import { AdBanner } from "../controllers";
import asyncHandler from "express-async-handler";
import { createAdBanner, deleteAdBanner } from "../middlewares/routes/adBanner";

const adBanner: Router = Router();

adBanner.post(
    "/",
    createAdBanner,
    asyncHandler(AdBanner.createAll)
);

adBanner.get(
    "/:id",
    asyncHandler(AdBanner.getWithId)
);

adBanner.delete(
    "/:id",
    deleteAdBanner,
    asyncHandler(AdBanner.delete)
);

export default adBanner;