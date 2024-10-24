import { Router, Request, Response } from "express";
import { Vendor } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const vendor: Router = Router();

vendor.post(
    "/add-profile-pic",
    uploads.single("image"),
    asyncHandler(Vendor.addProfilePicture)
);
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default vendor;