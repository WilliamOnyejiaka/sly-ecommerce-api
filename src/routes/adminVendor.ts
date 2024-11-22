import { Router, Request, Response } from "express";
import { AdminVendor } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminVendor: Router = Router();

adminVendor.get(
    "/paginate-vendors",
    adminAuthorization(['manage_all','manage_vendor']),
    asyncHandler(AdminVendor.paginateVendors)
);

adminVendor.get(
    "/get-all-vendors",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminVendor.getAllVendors)
);


adminVendor.get(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminVendor.getVendor)
);

adminVendor.delete(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminVendor.delete)
);

export default adminVendor; 
