import { Router, Request, Response } from "express";
import Product from "../controllers/Product";
import asyncHandler from "express-async-handler";
import { productUpload, idIsValid, pagination } from "../middlewares/routes/product";

const product: Router = Router();

product.get("/:id", idIsValid, asyncHandler(Product.getProduct));
product.post("/", productUpload, asyncHandler(Product.createProduct));
product.get("/", pagination, asyncHandler(Product.getProducts));


export default product;