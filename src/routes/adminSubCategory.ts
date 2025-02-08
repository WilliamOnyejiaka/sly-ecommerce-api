import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, uploads } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { createSubCategory, createSubCategoryAll, updateCategoryPriority, updateSubCategoryName } from "../middlewares/routes/category";
import { CategoryType } from "../types/enums";

const adminSubCategory: Router = Router();

adminSubCategory.get(
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
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.SubMain))
);

adminSubCategory.post(
    "/all",
    createSubCategoryAll,
    asyncHandler(CategoryManagement.createSubCategoryAll)
);


adminSubCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName(CategoryType.SubMain))
);

adminSubCategory.get(
    "/get-with-id/:categoryId",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithId(CategoryType.SubMain))
);

adminSubCategory.post(
    "/upload/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.SubMain))
);

adminSubCategory.patch(
    "/update-name",
    updateSubCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.SubMain))
);

adminSubCategory.patch(
    "/update-priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.SubMain))
);

adminSubCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.SubMain))
);

adminSubCategory.post(
    "/",
    createSubCategory,
    asyncHandler(CategoryManagement.createSubCategory)
);


adminSubCategory.get(
    "/",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getAllCategories(CategoryType.SubMain))
);

export default adminSubCategory;