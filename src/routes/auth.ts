import { Router, Request, Response } from "express";
import { Auth } from "../controllers";
import { getBasicAuthHeader, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const auth: Router = Router();

auth.post("/vendor-sign-up", validateBody([
    'firstName',
    'lastName',
    'password',
    'email',
    'businessName',
    'address',
    'phoneNumber'
]), asyncHandler(Auth.vendorSignUp));

auth.get("/vendor-login", getBasicAuthHeader, asyncHandler(Auth.vendorLogin));
auth.get("/vendor-email-otp/:email", asyncHandler(Auth.vendorEmailOTP));
auth.get("/confirm-vendor-email/:email/:otpCode",asyncHandler(Auth.vendorEmailVerification));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;