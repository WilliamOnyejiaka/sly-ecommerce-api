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
    asyncHandler(UserManagement.activateUser(UserType.VENDOR))
);

user.patch(
    "/vendor/deactivate",
    updateActiveStatus,
    asyncHandler(UserManagement.deactivateUser(UserType.VENDOR))
);

user.patch(
    "/customer/activate",
    updateActiveStatus,
    asyncHandler(UserManagement.activateUser(UserType.CUSTOMER))
);

user.patch(
    "/customer/deactivate",
    updateActiveStatus,
    asyncHandler(UserManagement.deactivateUser(UserType.CUSTOMER))
);

user.get(
    "/admin/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.ADMIN))
);

user.get(
    "/customer/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.CUSTOMER))
);

user.get(
    "/vendor/count",
    totalRecords,
    asyncHandler(UserManagement.totalRecords(UserType.VENDOR))
);

user.get(
    "/count-all-users",
    totalRecords,
    asyncHandler(UserManagement.countAllUsers)
);

user.get(
    "/count",
    totalRecords,
    asyncHandler(UserManagement.countAllNonAdminUsers)
);


user.get(
    "/vendor/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.VENDOR))
);

user.get(
    "/customer/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.CUSTOMER))
);

user.get(
    "/admin/paginate",
    paginateUsers,
    asyncHandler(UserManagement.paginateUsers(UserType.ADMIN))
);

user.get(
    "/vendor/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.VENDOR))
);


user.get(
    "/admin/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.ADMIN))
);

user.get(
    "/customer/:id",
    getUser,
    asyncHandler(UserManagement.getUser(UserType.CUSTOMER))
);

user.get(
    "/vendor",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.VENDOR))
);

user.get(
    "/customer",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.CUSTOMER))
);

user.get(
    "/admin",
    getUsers,
    asyncHandler(UserManagement.getAllUsers(UserType.ADMIN))
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