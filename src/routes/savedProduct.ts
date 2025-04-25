import { Router, Request, Response } from "express";
import Product from "../controllers/Product";
import asyncHandler from "express-async-handler";
import { productUpload, idIsValid, pagination } from "../middlewares/routes/product";

const savedProduct: Router = Router();

// savedProduct.get("/:id", idIsValid, asyncHandler(Product.getProduct));
// savedProduct.post("/", productUpload, asyncHandler(Product.createProduct));
// savedProduct.get("/", pagination, asyncHandler(Product.getProducts));


export default savedProduct;