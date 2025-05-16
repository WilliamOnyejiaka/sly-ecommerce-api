import { Router, Request, Response } from "express";
import { CategoryManagement } from "../../controllers";
import { adminAuthorization, uploads } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { createSubCategory, createSubCategoryAll, updateCategoryPriority, updateSubCategoryName, pagination } from "../../middlewares/routes/category";
import { CategoryType } from "../../types/enums";

const dashboardSubCategory: Router = Router();

dashboardSubCategory.get(
    "/name/:categoryName",
    asyncHandler(CategoryManagement.getWithName(CategoryType.SubMain))
);

dashboardSubCategory.get(
    "/id/:categoryId",
    asyncHandler(CategoryManagement.getWithId(CategoryType.SubMain))
);

dashboardSubCategory.post(
    "/all",
    createSubCategoryAll,
    asyncHandler(CategoryManagement.createSubCategoryAll)
);

dashboardSubCategory.post(
    "/upload/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.SubMain))
);

dashboardSubCategory.patch(
    "/name",
    updateSubCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.SubMain))
);

dashboardSubCategory.patch(
    "/priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.SubMain))
);

dashboardSubCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.SubMain))
);


dashboardSubCategory.get(
    "/",
    pagination,
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.SubMain))
);

dashboardSubCategory.post(
    "/",
    createSubCategory,
    asyncHandler(CategoryManagement.createSubCategory)
);

export default dashboardSubCategory;