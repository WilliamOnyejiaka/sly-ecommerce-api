import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { auth, vendor, store, seed, admin, role, permission, adminPermission, adminStore, dashboardCategory, customer, category, dashboardSubCategory, subcategory, adBanner, user } from "./../routes";
import { TwilioService } from "../services";
import { validateJWT, validateUser, handleMulterErrors, secureApi, vendorIsActive } from "./../middlewares";
import asyncHandler from "express-async-handler";
import { Admin } from "../controllers";
import { CustomerCache, VendorCache } from "../cache";
import { Vendor as VendorRepo, Customer as CustomerRepo } from "../repos";
import cors from "cors";
import axios from 'axios';
import { http } from "../constants";
import { Admin as AdminService } from "../services";
import blogRoutes from "../routes/blogRoutes"
import dotenv from "dotenv"

dotenv.config()
function createApp() {
    const app: Application = express();

    const stream = {
        write: (message: string) => logger.http(message.trim()),
    };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    app.use("/api/v1/seed", seed);
    app.get("/api/v1/admin/default-admin/:roleId", asyncHandler(Admin.defaultAdmin));

    // app.use(secureApi); TODO: uncomment this
    app.use("/api/v1/auth", auth);
    app.use(
        "/api/v1/vendor",
        validateJWT(["vendor"], env("tokenSecret")!),
        validateUser<VendorCache, VendorRepo>(new VendorCache(), new VendorRepo()),
        vendor
    );

    app.use("/api/v1/store", validateJWT(["vendor"], env("tokenSecret")!), vendorIsActive, store);
    app.use("/api/v1/admin", validateJWT(["admin"], env("tokenSecret")!), admin);
    app.use("/api/v1/admin/role", validateJWT(["admin"], env("tokenSecret")!), role);
    app.use("/api/v1/admin/permission", validateJWT(["admin"], env("tokenSecret")!), permission);
    app.use("/api/v1/admin/admin-permission", validateJWT(["admin"], env("tokenSecret")!), adminPermission);
    app.use("/api/v1/admin/store", validateJWT(["admin"], env("tokenSecret")!), adminStore);
    app.use("/api/v1/dashboard/category", validateJWT(["admin"], env("tokenSecret")!), dashboardCategory);
    app.use("/api/v1/category", validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), category);
    app.use("/api/v1/dashboard/subcategory", validateJWT(["admin"], env("tokenSecret")!), dashboardSubCategory);
    app.use("/api/v1/subcategory", validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), subcategory);
    app.use("/api/v1/ad-banner", validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), adBanner);
    app.use("/api/v1/dashboard/user", validateJWT(["admin",], env("tokenSecret")!), user);
    app.use("/api/blogs", blogRoutes)

    app.use(
        "/api/v1/customer",
        validateJWT(["customer"], env("tokenSecret")!),
        validateUser<CustomerCache, CustomerRepo>(new CustomerCache(), new CustomerRepo()),
        customer
    );

    app.get("/test2", async (req: Request, res: Response) => {
        try {
            const test = await axios.get("http://localhost:4000/test");
            console.log(test);

            const data = test.data;
            res.status(200).json({
                'error': false,
                'message': "result",
                'data': data
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Failed to fetch external data' });
        }
    });

    app.post("/test1", async (req: Request, res: Response, next: NextFunction) => {
        const twilio = new TwilioService();
        const serviceResult = await twilio.sendSMS(req.body.to, req.body.message);
        res.status(serviceResult.statusCode).json(serviceResult.json)
    });

    async function check(data: any, requiredPermissions: string[]): Promise<{
        error: Boolean,
        message: string,
        statusCode: number,
        data: any
    }> {
        const active = data.active;

        if (!active) {
            return {
                error: true,
                message: http('401')!,
                statusCode: 401,
                data: {}
            };
        }

        const adminId = data.id;
        const admin = await (new AdminService()).getAdminAndRole(adminId);

        if (!admin) {
            return {
                error: true,
                message: "Admin not found",
                statusCode: 404,
                data: {}
            };
        }

        const rolePermissions = admin.json.data.role.RolePermission;
        const directPermissions = admin.json.data.directPermissions;

        const rolePermissionsNames = rolePermissions.map((rp: any) => rp.permission.name);
        const directPermissionsNames = directPermissions.map((rp: any) => rp.permission.name);

        const allPermissions = new Set([...rolePermissionsNames, ...directPermissionsNames]);
        const hasPermission = requiredPermissions.includes("any") ? true : requiredPermissions.some((perm: any) => allPermissions.has(perm));

        if (!hasPermission) {
            return {
                error: true,
                message: "Access denied",
                statusCode: 403,
                data: {}
            };
        }

        return {
            error: false,
            message: "Access granted",
            statusCode: 200,
            data
        };
    }

    app.post("/validate-admin", validateJWT(['admin'], env("tokenSecret")!), async (req: Request, res: Response, next: NextFunction) => {
        const { requiredPermissions } = req.body;
        const result = await check(res.locals.data, requiredPermissions);

        res.status(result.statusCode).json({
            error: result.error,
            message: result.message,
            data: result.data
        });
        return;
    });


    app.use(handleMulterErrors);
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });
    return app;
}


export default createApp;