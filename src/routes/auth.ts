import { Router, Request, Response } from "express";
import { Auth } from "../controllers";
import { validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const auth: Router = Router();

auth.post("/vendor-sign-up", validateBody([
    'firstName',
    'lastName',
    'password',
    'email',
    'phoneNumber'
]), asyncHandler(Auth.vendorSignUp));

auth.post("/admin-login", validateBody(['email', 'password']), asyncHandler(Auth.adminLogin));
auth.post("/vendor-login",validateBody(['email','password']), asyncHandler(Auth.vendorLogin));
auth.get("/vendor-email-otp/:email", asyncHandler(Auth.vendorEmailOTP));
auth.get("/confirm-vendor-email/:email/:otpCode",asyncHandler(Auth.vendorEmailVerification));

auth.post("/customer/sign-up", validateBody([
    'firstName',
    'lastName',
    'password',
    'email',
    'street',
    'city',
    'phoneNumber',
    'zip'
]), asyncHandler(Auth.customerSignUp));

auth.post("/customer/login", validateBody(['email', 'password']), asyncHandler(Auth.customerLogin));
auth.get("/logout",asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;