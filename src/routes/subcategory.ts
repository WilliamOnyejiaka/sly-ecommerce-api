import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, uploads } from "../middlewares";
import asyncHandler from "express-async-handler";
import { createSubCategory, createSubCategoryAll, updateCategoryPriority, updateSubCategoryName, pagination } from "../middlewares/routes/category";
import { CategoryType } from "../types/enums";

const subcategory: Router = Router();

subcategory.get(
    "/name/:categoryName",
    asyncHandler(CategoryManagement.getWithName(CategoryType.SubMain))
);

subcategory.get(
    "/id/:categoryId",
    asyncHandler(CategoryManagement.getWithId(CategoryType.SubMain))
);

subcategory.post(
    "/all",
    createSubCategoryAll,
    asyncHandler(CategoryManagement.createSubCategoryAll)
);

subcategory.post(
    "/upload/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.SubMain))
);

subcategory.patch(
    "/name",
    updateSubCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.SubMain))
);

subcategory.patch(
    "/priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.SubMain))
);

subcategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.SubMain))
);


subcategory.get(
    "/",
    pagination,
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.SubMain))
);

subcategory.post(
    "/",
    createSubCategory,
    asyncHandler(CategoryManagement.createSubCategory)
);

export default subcategory;