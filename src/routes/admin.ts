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
    asyncHandler(Admin.createAdmin)
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

admin.patch(
    "/assign-role",
    adminAuthorization(['manage_all']),
    validateBody(['adminId','roleId']),
    asyncHandler(Admin.assignRole)
);

admin.get(
    "/",
    asyncHandler(Admin.getAdmin)
);

admin.delete(
    "/:adminId",
    adminAuthorization(['manage_all']),
    asyncHandler(Admin.delete)
);



export default admin;