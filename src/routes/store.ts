import { Router, Request, Response } from "express";
import { Store } from "../controllers";
import asyncHandler from "express-async-handler";
import { pagination, storeId } from "../middlewares/routes/store";

const store: Router = Router();

store.get(
    "/name/:storeName",
    asyncHandler(Store.getStoreWithName)
);
store.get(
    "/id/:storeId",
    storeId,
    asyncHandler(Store.getStoreWithId)
);
store.get("/", pagination, asyncHandler(Store.stores));

export default store;