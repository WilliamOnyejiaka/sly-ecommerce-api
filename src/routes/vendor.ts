import { Router, Request, Response } from "express";
import { Vendor } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const vendor: Router = Router();

vendor.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Vendor.addProfilePicture)
);

vendor.patch(
    "/update-first-name",
    validateBody(['firstName']),
    asyncHandler(Vendor.updateFirstName)
);

vendor.patch(
    "/update-last-name",
    validateBody(['lastName']),
    asyncHandler(Vendor.updateLastName)
);


export default vendor;