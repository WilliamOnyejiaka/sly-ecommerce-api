import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";

const category: Router = Router();

category.get(
    "/paginate-categories",
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
    "/get-with-name/:categoryName",
    asyncHandler(CategoryManagement.getCategoryWithName)
);

category.get(
    "/get-with-id/:id",
    asyncHandler(CategoryManagement.getCategoryWithName)
);

export default category;