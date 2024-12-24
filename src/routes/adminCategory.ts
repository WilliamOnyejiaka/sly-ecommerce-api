import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { createCategory } from "../middlewares/validators/category";

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
    asyncHandler(CategoryManagement.paginateCategories())
);

adminCategory.post(
    "/create-category",
    createCategory,
    validateBody([
        "name",
        "priority",
        "active"
    ]),
    asyncHandler(CategoryManagement.createCategory)
);

adminCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName)
);

adminCategory.get(
    "/get-with-id/:id",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName)
);


adminCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete)
);

export default adminCategory;