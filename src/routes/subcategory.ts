import { Router, Request, Response } from "express";
import { Category } from "../controllers";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { CategoryType } from "../types/enums";

const subcategory: Router = Router();

subcategory.get(
    "/paginate/:categoryId",
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
    asyncHandler(Category.paginateSubCategoryWithCategoryId)
);

subcategory.get(
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
    asyncHandler(Category.paginateCategories(CategoryType.SubMain))
);

subcategory.get(
    "/get-with-name/:categoryName",
    asyncHandler(Category.getCategoryWithName(CategoryType.SubMain))
);

subcategory.get(
    "/get-with-id/:categoryId",
    asyncHandler(Category.getCategoryWithId(CategoryType.SubMain))
);

subcategory.get(
    "/",
    asyncHandler(Category.getAllCategories(CategoryType.SubMain))
);


export default subcategory;