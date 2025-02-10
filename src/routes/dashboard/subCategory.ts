import { Router, Request, Response } from "express";
import { CategoryManagement } from "../../controllers";
import { adminAuthorization, uploads } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../../validators";
import { createSubCategory, createSubCategoryAll, updateCategoryPriority, updateSubCategoryName } from "../../middlewares/routes/category";
import { CategoryType } from "../../types/enums";

const dashboardSubCategory: Router = Router();

dashboardSubCategory.get(
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

dashboardSubCategory.post(
    "/all",
    createSubCategoryAll,
    asyncHandler(CategoryManagement.createSubCategoryAll)
);


dashboardSubCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName(CategoryType.SubMain))
);

dashboardSubCategory.get(
    "/get-with-id/:categoryId",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithId(CategoryType.SubMain))
);

dashboardSubCategory.post(
    "/upload/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage(CategoryType.SubMain))
);

dashboardSubCategory.patch(
    "/update-name",
    updateSubCategoryName,
    asyncHandler(CategoryManagement.updateName(CategoryType.SubMain))
);

dashboardSubCategory.patch(
    "/update-priority",
    updateCategoryPriority,
    asyncHandler(CategoryManagement.updatePriority(CategoryType.SubMain))
);

dashboardSubCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete(CategoryType.SubMain))
);

dashboardSubCategory.post(
    "/",
    createSubCategory,
    asyncHandler(CategoryManagement.createSubCategory)
);


dashboardSubCategory.get(
    "/",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getAllCategories(CategoryType.SubMain))
);

export default dashboardSubCategory;