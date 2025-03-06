
import { Router, Request, Response } from "express";
import { DashboardStore } from "../../controllers";
import { adminAuthorization, bannerUploads, uploads, validateBody } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { createStore } from "../../middlewares/routes/store";

const dashboardStore: Router = Router();

dashboardStore.get(
    "/paginate",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(DashboardStore.paginateStores)
);

dashboardStore.get(
    "/all",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(DashboardStore.getAllStores)
);

dashboardStore.get(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(DashboardStore.getStoreWithVendorId)
);

dashboardStore.delete(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(DashboardStore.delete)
);

dashboardStore.post(
    "/",
    createStore,
    asyncHandler(DashboardStore.createStore)
);

export default dashboardStore;