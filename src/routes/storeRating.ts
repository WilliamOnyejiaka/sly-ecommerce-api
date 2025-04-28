import { Router, Request, Response } from "express";
import { StoreRating } from "../controllers";
import asyncHandler from "express-async-handler";
import { idIsValid, ratingIsValid, pagination } from "../middlewares/routes/storeRating";

const storeRating: Router = Router();

storeRating.get("/:id", idIsValid, asyncHandler(StoreRating.getRating));
storeRating.get("/", pagination, asyncHandler(StoreRating.getRatings));
storeRating.post("/", ratingIsValid, asyncHandler(StoreRating.rate));

export default storeRating;