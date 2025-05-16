import { Router, Request, Response } from "express";
import { CategoryManagement } from "../../controllers";
import { adminAuthorization, uploads } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { createCategory, createCategoryAll, pagination, toggleActiveStatus, updateCategoryName, updateCategoryPriority, uploadCategoryImage } from "../../middlewares/routes/category";
import { CategoryType } from "../../types/enums";

const dashboardCategory: Router = Router();

dashboardCategory.get(
    "/name/:categoryName",
    asyncHandler(CategoryManagement.getWithName(CategoryType.Main))
);

dashboardCategory.get(
    "/id/:categoryId",
    asyncHandler(CategoryManagement.getWithId(CategoryType.Main))
);

dashboardCategory.post(
    "/all",
    createCategoryAll,
    asyncHandler(CategoryManagement.createCategoryAll)
);

dashboardCategory.post(
    "/upload/:categoryId",
    uploadCategoryImage,
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.Main))
);

dashboardCategory.patch(
    "/toggle-active-status",
    toggleActiveStatus,
    asyncHandler(CategoryManagement.toggleActiveStatus)
);

dashboardCategory.patch(
    "/name",
    updateCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.Main))
);

dashboardCategory.patch(
    "/priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.Main))
);

dashboardCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.Main))
);


dashboardCategory.get(
    "/",
    pagination,
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.Main))
);

dashboardCategory.post(
    "/",
    createCategory,
    asyncHandler(CategoryManagement.createCategory)
);

export default dashboardCategory;