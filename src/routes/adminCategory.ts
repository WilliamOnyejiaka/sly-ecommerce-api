import { Router, Request, Response } from "express";
import { AdminCategory } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminCategory: Router = Router();

adminCategory.get(
    "/paginate-categories",
    adminAuthorization(['any']),
    asyncHandler(AdminCategory.paginateCategories())
);


// permission.get(
//     "/get-permission-with-name/:roleName",
//     adminAuthorization(['any']),
//     asyncHandler(Permission.getPermissionWithName)
// );

adminCategory.post(
    "/create-category",
    adminAuthorization(['manage_all']),
    validateBody([
        "name",
        "priority",
        "active"
    ]),
    asyncHandler(AdminCategory.createCategory)
);

// permission.get(
//     "/get-all-permissions",
//     adminAuthorization(['any']),
//     asyncHandler(Permission.getAllPermissions)
// );

// // role.delete(
// //     "/:roleId",
// //     adminAuthorization(['manage_all']),
// //     asyncHandler(Permission.delete)
// // );

export default adminCategory;