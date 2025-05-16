
import { Router, Request, Response } from "express";
import { DashboardStore } from "../../controllers";
import { adminAuthorization, bannerUploads, uploads, validateBody } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { createStore } from "../../middlewares/routes/store";

const dashboardStore: Router = Router();

dashboardStore.get(
    "/vendor/:vendorId",
    asyncHandler(DashboardStore.getStoreWithVendorId)
);

dashboardStore.delete(
    "/vendor/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(DashboardStore.delete)
);

dashboardStore.get(
    "/",
    asyncHandler(DashboardStore.paginateStores)
);

dashboardStore.post(
    "/",
    createStore,
    asyncHandler(DashboardStore.createStore)
);

export default dashboardStore;