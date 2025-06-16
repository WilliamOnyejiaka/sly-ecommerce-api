import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StoreFollower } from "../controllers";
import { follow, following, followers, countFollowing, countFollowers } from "./../middlewares/routes/storeFollower";

const storeFollower: Router = Router();

storeFollower.get("/followers/:storeId", followers, asyncHandler(StoreFollower.followers));
storeFollower.get("/following", following, asyncHandler(StoreFollower.following));
storeFollower.get("/count/followers/:storeId", countFollowers, asyncHandler(StoreFollower.countFollowers));
storeFollower.get("/count/following/:customerId", countFollowing, asyncHandler(StoreFollower.countFollowing));
storeFollower.get("/:storeId", follow, asyncHandler(StoreFollower.follow));

export default storeFollower;
