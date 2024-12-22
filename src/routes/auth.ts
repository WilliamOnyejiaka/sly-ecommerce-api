import { Router, Request, Response } from "express";
import { Auth } from "../controllers";
import { validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { emailIsValid, passwordIsValid, phoneNumberIsValid, tokenIsPresent, userEmailExists, zipCodeIsValid } from "../middlewares/validators";
import { Admin, Customer, Vendor } from "../repos";

const auth: Router = Router();

auth.post(
    "/vendor-sign-up",
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'phoneNumber'
    ]),
    [
        emailIsValid,
        passwordIsValid,
        phoneNumberIsValid,
        userEmailExists<Vendor>(new Vendor())
    ],
    asyncHandler(Auth.vendorSignUp)
);

auth.post("/admin-login", validateBody(['email', 'password']), asyncHandler(Auth.adminLogin));
auth.post("/vendor-login", validateBody(['email', 'password']), asyncHandler(Auth.vendorLogin));
auth.get("/vendor-email-otp/:email", asyncHandler(Auth.vendorEmailOTP));
auth.get("/confirm-vendor-email/:email/:otpCode", asyncHandler(Auth.vendorEmailVerification));

auth.post(
    "/customer/sign-up",
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'street',
        'city',
        'phoneNumber',
        'zip'
    ]),
    [
        emailIsValid,
        passwordIsValid,
        phoneNumberIsValid,
        zipCodeIsValid,
        userEmailExists<Customer>(new Customer())
    ],
    asyncHandler(Auth.customerSignUp)
);

auth.post(
    "/admin/sign-up",
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "key"
    ]),
    [
        emailIsValid,
        passwordIsValid,
        phoneNumberIsValid,
        userEmailExists<Admin>(new Admin())
    ],
    asyncHandler(Auth.adminSignUp)
);

auth.post("/customer/login", validateBody(['email', 'password']), asyncHandler(Auth.customerLogin));
auth.get("/logout", [tokenIsPresent], asyncHandler(Auth.logOut));
// auth.get("/google", Auth.oauthRedirect);
// auth.get("/google/callback", Auth.oauthCallback);

export default auth;