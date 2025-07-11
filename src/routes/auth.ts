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

auth.post("/admin/login", login, asyncHandler(Auth.login(UserType.ADMIN)));
auth.post("/vendor/login", login, asyncHandler(Auth.login(UserType.VENDOR)));
auth.post("/customer/login", login, asyncHandler(Auth.login(UserType.CUSTOMER)));


auth.get("/vendor/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.VENDOR, OTPType.Verification)));
auth.get("/vendor/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.VENDOR)));

auth.get("/customer/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.CUSTOMER, OTPType.Verification)));
auth.get("/customer/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.CUSTOMER)));

auth.get("/admin/otp/:email", asyncHandler(Auth.sendUserOTP(UserType.ADMIN, OTPType.Verification)));
auth.get("/admin/email-verification/:email/:otpCode", asyncHandler(Auth.emailVerification(UserType.ADMIN)));

auth.get("/vendor/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.VENDOR, OTPType.Reset)));
auth.get("/vendor/confirm-otp/:email/:otpCode", asyncHandler(Auth.otpConfirmation(UserType.VENDOR)));
auth.patch(
    "/vendor/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.VENDOR))
);

auth.get("/admin/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.ADMIN, OTPType.Reset)));
auth.get("/admin/confirm-otp/:email/:otpCode", asyncHandler(Auth.otpConfirmation(UserType.ADMIN)));
auth.patch(
    "/admin/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.ADMIN))
);

auth.get("/customer/forgot-password/:email", asyncHandler(Auth.sendUserOTP(UserType.CUSTOMER, OTPType.Reset)));
auth.get("/customer/confirm-otp/:email/:otpCode", asyncHandler(Auth.otpConfirmation(UserType.CUSTOMER)));
auth.patch(
    "/customer/reset-password",
    resetPassword,
    asyncHandler(Auth.passwordReset(UserType.CUSTOMER))
);

auth.get("/logout", logOut, asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;