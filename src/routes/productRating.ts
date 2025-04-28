import { Router, Request, Response } from "express";
import { ProductRating } from "../controllers";
import asyncHandler from "express-async-handler";
import { idIsValid, ratingIsValid, pagination } from "../middlewares/routes/productRating";

const productRating: Router = Router();

productRating.get("/:id", idIsValid, asyncHandler(ProductRating.getRating));
productRating.get("/", pagination, asyncHandler(ProductRating.getRatings));
productRating.post("/", ratingIsValid, asyncHandler(ProductRating.rate));

export default productRating;