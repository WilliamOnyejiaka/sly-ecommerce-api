import { Router, Request, Response } from "express";
import { FavoriteStore } from "../controllers";
import asyncHandler from "express-async-handler";
import { storeIdIsValid, idIsValid, pagination } from "../middlewares/routes/favoriteStore";

const favoriteStore: Router = Router();

favoriteStore.get("/:storeId", idIsValid, asyncHandler(FavoriteStore.favoriteStore));
favoriteStore.get("/", pagination, asyncHandler(FavoriteStore.favoriteStores));
favoriteStore.post("/", storeIdIsValid, asyncHandler(FavoriteStore.addStore));

export default favoriteStore;