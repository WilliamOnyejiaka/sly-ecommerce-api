import { Router, Request, Response } from "express";
import { Customer } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const customer: Router = Router();

customer.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Customer.uploadProfilePic)
);

customer.get(
    "/",
    asyncHandler(Customer.getCustomerAll)
);

export default customer;