import { Router, Request, Response } from "express";
import { NewProductInbox } from "../controllers";
import asyncHandler from "express-async-handler";
import { idIsValid, pagination } from "../middlewares/routes/newProductInbox";

const newProductInbox: Router = Router();

newProductInbox.get("/", pagination, asyncHandler(NewProductInbox.inbox()));
newProductInbox.get("/viewed", pagination, asyncHandler(NewProductInbox.viewed()));
newProductInbox.get("/un-viewed", pagination, asyncHandler(NewProductInbox.unViewed()));
newProductInbox.get("/view/:id", idIsValid, asyncHandler(NewProductInbox.markAsViewed));


export default newProductInbox;