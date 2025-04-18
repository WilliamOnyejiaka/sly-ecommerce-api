import { Router, Request, Response } from "express";
import { Category } from "../controllers";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { CategoryType } from "../types/enums";

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
    asyncHandler(Category.paginateCategories(CategoryType.Main))
);

category.get(
    "/get-with-name/:categoryName",
    asyncHandler(Category.getCategoryWithName(CategoryType.Main))
);

category.get(
    "/get-with-id/:categoryId",
    asyncHandler(Category.getCategoryWithId(CategoryType.Main))
);

category.get(
    "/",
    asyncHandler(Category.getAllCategories(CategoryType.Main))
);


export default category;