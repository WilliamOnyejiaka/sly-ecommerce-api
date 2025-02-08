import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, uploads } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { createCategory, createCategoryAll, toggleActiveStatus, updateCategoryName, updateCategoryPriority } from "../middlewares/routes/category";
import { CategoryType } from "../types/enums";

const adminCategory: Router = Router();

adminCategory.get(
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

adminCategory.post(
    "/all",
    createCategoryAll,
    asyncHandler(CategoryManagement.createCategoryAll)
);

adminCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName(CategoryType.Main))
);

adminCategory.get(
    "/get-with-id/:categoryId",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithId(CategoryType.Main))
);

adminCategory.post(
    "/upload/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.Main))
);

adminCategory.patch(
    "/toggle-active-status",
    toggleActiveStatus,
    asyncHandler(CategoryManagement.toggleActiveStatus)
);

adminCategory.patch(
    "/update-name",
    updateCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.Main))
);

adminCategory.patch(
    "/update-priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.Main))
);

adminCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.Main))
);

adminCategory.post(
    "/",
    createCategory,
    asyncHandler(CategoryManagement.createCategory)
);

adminCategory.get(
    "/",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getAllCategories(CategoryType.Main))
);

export default adminCategory;