import { Router, Request, Response } from "express";
import { Store } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const store: Router = Router();

store.post("/create-store", validateBody([
    'name', 
    'address',
]), asyncHandler(Store.createStore));

store.post("/add-logo/:storeId", uploads.single("logo"), asyncHandler(Store.addStoreLogo));
store.post("/add-banners/:storeId", uploads.any(),asyncHandler(Store.addBanners));

export default store;