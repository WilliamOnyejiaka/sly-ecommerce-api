import { Router, Request, Response } from "express";
import { Auth } from "../controllers";
import asyncHandler from "express-async-handler";
import { adminSignUp, customerSignUp, login, logOut, resetPassword, vendorSignUp } from "../middlewares/routes/auth";
import { OTPType, UserType } from "../types/enums";

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

auth.post("/admin/login", login, asyncHandler(Auth.login(UserType.Admin)));
auth.post("/vendor/login", login, asyncHandler(Auth.login(UserType.Vendor)));
auth.post("/customer/login", login, asyncHandler(Auth.login(UserType.Customer)));


auth.get("/vendor/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.Vendor, OTPType.Verification)));
auth.get("/vendor/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.Vendor)));

auth.get("/customer/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.Customer, OTPType.Verification)));
auth.get("/customer/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.Customer)));

auth.get("/admin/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.Admin, OTPType.Verification)));
auth.get("/admin/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.Admin)));

auth.get("/vendor/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.Vendor, OTPType.Reset)));
auth.patch(
    "/vendor/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.Vendor))
);

auth.get("/admin/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.Admin, OTPType.Reset)));
auth.patch(
    "/admin/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.Admin))
);

auth.get("/customer/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.Customer, OTPType.Reset)));
auth.patch(
    "/customer/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.Customer))
);

auth.get("/logout", logOut, asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;