import { Router } from "express";
import { FYPProduct } from "../../controllers";
import asyncHandler from "express-async-handler";
import { idIsValid, productId, pagination } from "../../middlewares/routes/product";

const fypProduct: Router = Router();

fypProduct.get("/store/:storeId", idIsValid, asyncHandler(FYPProduct.getStoreProducts));
fypProduct.get("/like/:productId", productId, FYPProduct.like);
fypProduct.get("/:id", idIsValid, asyncHandler(FYPProduct.getProduct));
fypProduct.get("/", pagination, asyncHandler(FYPProduct.getProducts));

export default fypProduct;