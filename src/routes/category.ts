import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";

const category: Router = Router();

category.get(
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

category.get(
    "/get-category-with-name/:categoryName",
    asyncHandler(CategoryManagement.getCategoryWithName)
);

category.get(
    "/get-category-with-id/:id",
    asyncHandler(CategoryManagement.getCategoryWithName)
);

export default category;