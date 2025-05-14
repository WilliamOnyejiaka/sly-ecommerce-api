import { Router, Request, Response } from "express";
import { ProductManagement } from "../../controllers";
import asyncHandler from "express-async-handler";
import { productUpload, idIsValid, pagination, publishDraft } from "../../middlewares/routes/product";

const vendorProductManagement: Router = Router();

vendorProductManagement.get("/:id", idIsValid, asyncHandler(ProductManagement.getProduct));
vendorProductManagement.post("/", productUpload, asyncHandler(ProductManagement.createProduct));
vendorProductManagement.get("/", pagination, asyncHandler(ProductManagement.getProducts));
vendorProductManagement.get("/drafts/:storeId", pagination, asyncHandler(ProductManagement.drafts));
vendorProductManagement.patch("/drafts/publish", publishDraft, asyncHandler(ProductManagement.publishDraft));

export default vendorProductManagement;