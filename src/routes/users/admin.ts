import { Router, Request, Response } from "express";
import { Admin } from "../../controllers";
import { adminAuthorization, uploads, validateBody } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { bodyNumberIsValid, emailIsValid, paramNumberIsValid, passwordIsValid, phoneNumberIsValid, userEmailExists, userPhoneNumberExists } from "../../middlewares/validators";
import { Admin as AdminRepo } from "../../repos";

const admin: Router = Router();

admin.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Admin.uploadProfilePicture)
);

admin.get(
    "/generate-sign-up-key/:roleId",
    adminAuthorization(['manage_all']),
    [paramNumberIsValid('roleId')],
    asyncHandler(Admin.generateSignUpKey)
);

admin.get("/get-admin-and-role", asyncHandler(Admin.getAdminAndRole));

admin.post(
    "/create-admin",
    adminAuthorization(['manage_all']),
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "roleId",
        "active"
    ]),
    [
        emailIsValid,
        passwordIsValid, // ! TODO: add a proper phone number validation check 
        // phoneNumberIsValid,
        userPhoneNumberExists<AdminRepo>(new AdminRepo()),
        userEmailExists<AdminRepo>(new AdminRepo())
    ],
    asyncHandler(Admin.createAdmin)
);

// admin.patch(
//     "/deactivate-admin",
//     adminAuthorization(['manage_all']),
//     validateBody(['adminId']),
//     [bodyNumberIsValid('adminId')],
//     asyncHandler(Admin.deactivateAdmin())
// );

// admin.patch(
//     "/activate-admin",
//     adminAuthorization(['manage_all']),
//     validateBody(['adminId']),
//     [bodyNumberIsValid('adminId')],
//     asyncHandler(Admin.activateAdmin())
// );

admin.patch(
    "/assign-role",
    adminAuthorization(['manage_all']),
    validateBody(['adminId', 'roleId']),
    [bodyNumberIsValid('adminId'), bodyNumberIsValid('roleId')],
    asyncHandler(Admin.assignRole)
);

admin.patch(
    "/:adminId",
    adminAuthorization(['manage_all']),
    validateBody([
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "roleId",
        "active"
    ]), // I  added required fields to validate here, like ['firstName', 'lastName']
    [
        bodyNumberIsValid('roleId'),
        paramNumberIsValid('adminId'),
        emailIsValid,
        // Optionally: phoneNumberIsValid,
    ],

    asyncHandler(Admin.updateAdmin)
);


admin.delete(
    "/:adminId",
    adminAuthorization(['manage_all']),
    [paramNumberIsValid('adminId')],
    asyncHandler(Admin.deleteAdmin)
);

admin.get(
    "/",
    asyncHandler(Admin.getAdmin)
);

admin.delete(
    "/",
    asyncHandler(Admin.delete)
);


export default admin;