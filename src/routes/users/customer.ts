import { Router, Request, Response } from "express";
import { Customer } from "../../controllers";
import { uploads } from "../../middlewares";
import asyncHandler from "express-async-handler";
import { validateUpdateUser } from "./../../middlewares/routes/user";

const customer: Router = Router();

customer.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Customer.uploadProfilePicture)
);

customer.get(
    "/",
    asyncHandler(Customer.getCustomerAll)
);

customer.put("/", validateUpdateUser, asyncHandler(Customer.updateProfile));

customer.delete(
    "/",
    asyncHandler(Customer.delete)
);

export default customer;