import { Router, Request, Response } from "express";
import { SavedProduct } from "../controllers";
import asyncHandler from "express-async-handler";
import { idIsValid, productIdIsValid, pagination } from "../middlewares/routes/savedProduct";

const savedProduct: Router = Router();

savedProduct.get("/:productId", idIsValid, asyncHandler(SavedProduct.savedProduct));
savedProduct.get("/", pagination, asyncHandler(SavedProduct.savedProducts));
savedProduct.post("/", productIdIsValid, asyncHandler(SavedProduct.addProduct));

export default savedProduct;