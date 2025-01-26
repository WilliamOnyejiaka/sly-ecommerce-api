import { Router, Request, Response } from "express";
import { Auth } from "../controllers";
import asyncHandler from "express-async-handler";
import { adminSignUp, customerSignUp, login, logOut, vendorSignUp } from "../middlewares/validators/auth";
import { OTPType, UserType } from "../types/enums";
import { validateBody } from "../middlewares";

const auth: Router = Router();

auth.post(
    "/vendor/sign-up",
    vendorSignUp,
    asyncHandler(Auth.vendorSignUp)
);

auth.post(
    "/customer/sign-up",
    customerSignUp,
    asyncHandler(Auth.customerSignUp)
);

auth.post(
    "/admin/sign-up",
    adminSignUp,
    asyncHandler(Auth.adminSignUp)
);

auth.post("/admin/login", login, asyncHandler(Auth.login("admin")));
auth.post("/vendor/login", login, asyncHandler(Auth.login("vendor")));
auth.post("/customer/login", login, asyncHandler(Auth.login("customer")));


auth.get("/vendor/otp/:email", asyncHandler(Auth.sendUserOTP("vendor", OTPType.Verification)));// ! TODO: change strings to constants
auth.get("/vendor/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification("vendor")));

auth.get("/customer/otp/:email", asyncHandler(Auth.sendUserOTP("customer", OTPType.Verification)));
auth.get("/customer/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification("customer")));

auth.get("/admin/otp/:email", asyncHandler(Auth.sendUserOTP("admin", OTPType.Verification)));
auth.get("/admin/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification("admin")));

auth.get("/vendor/forgot-password/:email", asyncHandler(Auth.sendUserOTP("vendor", OTPType.Reset)));
auth.patch(
    "/vendor/reset-password",
    validateBody([
        'newPassword',
        'otp',
        'email'
    ]),
    asyncHandler(Auth.passwordReset(UserType.Vendor))
);

auth.get("/admin/forgot-password/:email", asyncHandler(Auth.sendUserOTP("admin", OTPType.Reset)));
auth.patch(
    "/admin/reset-password",
    validateBody([
        'newPassword',
        'otp',
        'email'
    ]),
    asyncHandler(Auth.passwordReset(UserType.Admin))
);

auth.get("/customer/forgot-password/:email", asyncHandler(Auth.sendUserOTP("customer", OTPType.Reset)));
auth.patch(
    "/customer/reset-password",
    validateBody([
        'newPassword',
        'otp',
        'email'
    ]),
    asyncHandler(Auth.passwordReset(UserType.Customer))
);

auth.get("/logout", logOut, asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;