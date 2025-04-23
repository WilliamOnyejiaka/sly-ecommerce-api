import { Router, Request, Response } from "express";
import Product from "../controllers/Product";
import asyncHandler from "express-async-handler";
import { productUpload } from "../middlewares/routes/product";

const product: Router = Router();

product.post("/", productUpload, asyncHandler(Product.createProduct));

export default product;