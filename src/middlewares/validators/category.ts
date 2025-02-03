import { Category, SubCategory } from "../../repos";
import adminAuthorization from "../adminAuthorize";
import validateBody from "./validateBody";
import { bodyBooleanIsValid, bodyNumberIsValid, itemIdExists, itemNameExists } from "./validators";

const categoryNameExists = itemNameExists<Category>(new Category(), "name");
const adminAuth = adminAuthorization(['manage_all']);

export const createCategory = [
    adminAuth,
    validateBody([
        "name",
        "priority",
        "active"
    ]),
    bodyBooleanIsValid('active'),
    bodyNumberIsValid('priority'),
    categoryNameExists
];

export const createSubCategory = [
    adminAuth,
    validateBody([
        "name",
        "priority",
        "categoryId"
    ]),
    bodyNumberIsValid('priority'),
    itemNameExists<SubCategory>(new SubCategory(), "name"),
    itemIdExists<Category>(new Category(), "categoryId")
];

export const toggleActiveStatus = [
    adminAuth,
    validateBody([
        "id",
        "activate"
    ]),
    bodyBooleanIsValid('activate'),
    bodyNumberIsValid('id')
];

export const updateName = [
    adminAuth,
    validateBody([
        "id",
        "name"
    ]),
    bodyNumberIsValid('id'),
    categoryNameExists
];

export const updateCategoryName = [
    ...updateName,
    categoryNameExists
];

export const updateSubCategoryName = [
    ...updateName,
    itemNameExists<SubCategory>(new SubCategory(), "name")
];

export const updateCategoryPriority = [
    adminAuth,
    validateBody([
        "id",
        "priority"
    ]),
    bodyNumberIsValid('id'),
    bodyNumberIsValid('priority')
];