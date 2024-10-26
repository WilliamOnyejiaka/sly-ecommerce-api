import { Router, Request, Response } from "express";
import { Admin } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const admin: Router = Router();

// admin.post(
//     "/upload-profile-pic",
//     uploads.single("image"),
//     asyncHandler(Vendor.addProfilePicture)
// );
admin.get("/default-admin", Admin.defaultAdmin);

export default admin;