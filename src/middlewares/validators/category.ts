import { Category } from "../../repos";
import adminAuthorization from "../adminAuthorize";
import { itemNameExists } from "./validators";

const categoryNameExists = itemNameExists<Category>(new Category(),"name");
const adminAuth = adminAuthorization(['manage_all']);

export const createCategory = [
    categoryNameExists,
    adminAuth
];