import auth from "./auth";
import vendor from "./vendor";
import store from "./store";
import admin from "./admin";
import image from "./image";
import asyncHandler from "express-async-handler";
import { Vendor } from "../controllers";
import { Router, Request, Response } from "express";
import seed from "./seed";
import role from "./role";
import adminVendor from "./adminVendor";
import permission from "./permission";
import adminPermission from "./adminPermission";
import adminStore from "./adminStore";

export {
    auth,
    vendor,
    store,
    admin,
    image,
    seed,
    role,
    adminVendor,
    permission,
    adminPermission,
    adminStore
};
