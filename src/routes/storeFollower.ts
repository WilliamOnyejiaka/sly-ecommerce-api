import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StoreFollower } from "../controllers";
import { follow } from "./../middlewares/routes/storeFollower";

const storeFollower: Router = Router();

storeFollower.get("/count/:storeId", follow, asyncHandler(StoreFollower.countFollowers));
storeFollower.get("/:storeId", follow, asyncHandler(StoreFollower.follow));

export default storeFollower;
