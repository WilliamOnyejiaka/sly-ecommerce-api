import { Router, Request, Response } from "express";
import { CategoryManagement } from "../../controllers";
import { adminAuthorization, uploads } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../../validators";
import { createCategory, createCategoryAll, toggleActiveStatus, updateCategoryName, updateCategoryPriority, uploadCategoryImage } from "../../middlewares/routes/category";
import { CategoryType } from "../../types/enums";

const dashboardCategory: Router = Router();

dashboardCategory.get(
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
    asyncHandler(CategoryManagement.paginateCategories(CategoryType.Main))
);

dashboardCategory.post(
    "/all",
    createCategoryAll,
    asyncHandler(CategoryManagement.createCategoryAll)
);

dashboardCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName(CategoryType.Main))
);

dashboardCategory.get(
    "/get-with-id/:categoryId",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithId(CategoryType.Main))
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
    "/update-name",
    updateCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.Main))
);

dashboardCategory.patch(
    "/update-priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.Main))
);

dashboardCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.Main))
);

dashboardCategory.post(
    "/",
    createCategory,
    asyncHandler(CategoryManagement.createCategory)
);

dashboardCategory.get(
    "/",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getAllCategories(CategoryType.Main))
);

export default dashboardCategory;