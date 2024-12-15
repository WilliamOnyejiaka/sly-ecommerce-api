import { Router, Request, Response } from "express";
import { AdminCategory } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";

const adminCategory: Router = Router();

adminCategory.get(
    "/paginate-categories",
    adminAuthorization(['any']),
    validateQueryParams([
        {
            name: "page",
            type: "number"
        },
        {
            name: "pageSize",
            type: "number"
        }
    ]),
    asyncHandler(AdminCategory.paginateCategories())
);

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

adminCategory.get(
    "/get-category-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(AdminCategory.getCategoryWithName)
);

adminCategory.get(
    "/get-category-with-id/:id",
    adminAuthorization(['any']),
    asyncHandler(AdminCategory.getCategoryWithName)
);


adminCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(AdminCategory.delete)
);

export default adminCategory;