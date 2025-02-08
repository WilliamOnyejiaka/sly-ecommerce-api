import { Router } from "express";
import { UserManagement } from "../../controllers";
import asyncHandler from "express-async-handler";
import { UserType } from "../../types/enums";
import {
    adminSignUpKey,
    createCustomer,
    createVendor,
    getUser,
    getUsers,
    paginateUsers,
    totalRecords,
    updateActiveStatus
} from "../../middlewares/routes/user";

const user: Router = Router();

user.get(
    "/admin-sign-up-key/:roleId",
    adminSignUpKey,
    asyncHandler(UserManagement.generateSignUpKey)
);

user.patch(
    "/vendor/activate",
    updateActiveStatus,
    asyncHandler(UserManagement.activateUser(UserType.Vendor))
);

user.patch(
    "/vendor/deactivate",
    updateActiveStatus,
    asyncHandler(UserManagement.deactivateUser(UserType.Vendor))
);

user.patch(
    "/customer/activate",
    updateActiveStatus,
    asyncHandler(UserManagement.activateUser(UserType.Customer))
);

user.patch(
    "/customer/deactivate",
    updateActiveStatus,
    asyncHandler(UserManagement.deactivateUser(UserType.Customer))
);

user.get(
    "/admin/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.Admin))
);

user.get(
    "/customer/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.Customer))
);

user.get(
    "/vendor/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.Vendor))
);

user.get(
    "/vendor/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.Vendor))
);

user.get(
    "/customer/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.Customer))
);

user.get(
    "/admin/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.Admin))
);

user.get(
    "/vendor/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.Vendor))
);


user.get(
    "/admin/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.Admin))
);

user.get(
    "/customer/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.Customer))
);

user.get(
    "/vendor",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.Vendor))
);

user.get(
    "/customer",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.Customer))
);

user.get(
    "/admin",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.Admin))
);

user.post(
    "/vendor",
    createVendor,
    asyncHandler(UserManagement.createVendor)
);

user.post(
    "/customer",
    createCustomer,
    asyncHandler(UserManagement.createCustomer)
);

user.post(
    "/admin",
    createCustomer,
    asyncHandler(UserManagement.createAdmin)
);

export default user;