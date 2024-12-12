import { Router, Request, Response } from "express";
import { AdminVendor } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminVendor: Router = Router();
const anyAuth = adminAuthorization(['any']);

adminVendor.get(
    "/paginate-vendors",
    anyAuth,
    asyncHandler(AdminVendor.paginateVendors)
);

adminVendor.get(
    "/get-all-vendors",
    anyAuth,
    asyncHandler(AdminVendor.getAllVendors)
);

adminVendor.get(
    "/total-records",
    anyAuth,
    asyncHandler(AdminVendor.totalRecords)
);

adminVendor.patch(
    "/deactivate-vendor",
    adminAuthorization(['manage_all', 'manage_vendor']),
    validateBody(['vendorId']),
    asyncHandler(AdminVendor.deactivateVendor())
);

adminVendor.patch(
    "/activate-vendor",
    adminAuthorization(['manage_all', 'manage_vendor']),
    validateBody(['vendorId']),
    asyncHandler(AdminVendor.activateVendor())
);

adminVendor.get(
    "/:vendorId",
    anyAuth,
    asyncHandler(AdminVendor.getVendor)
);

adminVendor.delete(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminVendor.delete)
);

export default adminVendor; 
