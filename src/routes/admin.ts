import { Router, Request, Response } from "express";
import { Admin } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const admin: Router = Router();

admin.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Admin.uploadProfilePicture)
);

admin.get(
    "/",
    asyncHandler(Admin.getAdmin)
);

admin.get("/get-admin-and-role", asyncHandler(Admin.getAdminAndRole));

admin.post(
    "/create-admin",
    adminAuthorization(['manage_finance', 'manage_support']),
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "roleId",
        "active"
    ]),
    asyncHandler(Admin.createAdmin)
);

admin.delete(
    "/:adminId",
    adminAuthorization(['manage_all']),
    asyncHandler(Admin.delete)
);

admin.patch(
    "/deactivate-admin",
    adminAuthorization(['manage_all']),
    validateBody(['adminId']),
    asyncHandler(Admin.deactivateAdmin())
);

admin.patch(
    "/activate-admin",
    adminAuthorization(['manage_all']),
    validateBody(['adminId']),
    asyncHandler(Admin.activateAdmin())
);

export default admin;