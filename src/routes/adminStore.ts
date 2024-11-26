
import { Router, Request, Response } from "express";
import { AdminStore } from "../controllers";
import { adminAuthorization, bannerUploads, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminStore: Router = Router();

adminStore.get(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminStore.retrieveVendorStore)
);

export default adminStore;