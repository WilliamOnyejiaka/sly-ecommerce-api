import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, uploads } from "../middlewares";
import asyncHandler from "express-async-handler";
import { createCategory, createCategoryAll, pagination, toggleActiveStatus, updateCategoryName, updateCategoryPriority, uploadCategoryImage } from "../middlewares/routes/category";
import { CategoryType } from "../types/enums";

const category: Router = Router();

category.get(
    "/name/:categoryName",
    asyncHandler(CategoryManagement.getWithName(CategoryType.Main))
);

category.get(
    "/id/:categoryId",
    asyncHandler(CategoryManagement.getWithId(CategoryType.Main))
);

category.post(
    "/all",
    createCategoryAll,
    asyncHandler(CategoryManagement.createCategoryAll)
);

category.post(
    "/upload/:categoryId",
    uploadCategoryImage,
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.Main))
);

category.patch(
    "/toggle-active-status",
    toggleActiveStatus,
    asyncHandler(CategoryManagement.toggleActiveStatus)
);

category.patch(
    "/name",
    updateCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.Main))
);

category.patch(
    "/priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.Main))
);

category.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.Main))
);


category.get(
    "/",
    pagination,
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.Main))
);

category.post(
    "/",
    createCategory,
    asyncHandler(CategoryManagement.createCategory)
);

export default category;