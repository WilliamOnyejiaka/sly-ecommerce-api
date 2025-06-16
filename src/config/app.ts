import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger, redisBull, redisPub, redisSub, streamRouter, cronJobs } from ".";
import {
    auth,
    vendor,
    store,
    seed,
    admin,
    role,
    permission,
    adminPermission,
    adminStore,
    category,
    customer,
    subcategory,
    adBanner,
    user,
    storeFollower,
    comment,
    savedProduct,
    favoriteStore,
    storeRating,
    productRating
} from "./../routes";
import { vendorProductManagement } from "../routes/vendor";
import { fypProduct } from "./../routes/fyp";
import { validateJWT, validateUser, handleMulterErrors, secureApi, vendorIsActive } from "./../middlewares";
import asyncHandler from "express-async-handler";
import { Admin } from "../controllers";
import { CustomerCache, VendorCache } from "../cache";
import { Vendor as VendorRepo, Customer as CustomerRepo } from "../repos";
import cors from "cors";
import axios from 'axios';
import { http } from "../constants";
import { Admin as AdminService } from "../services";
import { myQueue, uploadQueue } from "../jobs/queues";
import initializeWorkers from "../jobs/workers";
import cluster from "cluster";

function createApp() {
    const app: Application = express();

    const stream = {
        write: (message: string) => logger.http(message.trim()),
    };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    // app.use(secureApi); TODO: uncomment this

    app.use("/api/v1/seed", seed);
    app.get("/api/v1/admin/default-admin/:roleId", asyncHandler(Admin.defaultAdmin));
    app.use("/api/v1/fyp/product", validateJWT(["customer"]), fypProduct);
    app.use("/api/v1/vendor/product", validateJWT(["vendor"]), vendorProductManagement);

    app.use("/api/v1/auth", auth);
    app.use(
        "/api/v1/vendor",
        validateJWT(["vendor"]),
        validateUser<VendorCache, VendorRepo>(new VendorCache(), new VendorRepo()),
        vendor
    );
    app.use("/api/v1/store/follow", storeFollower);
    app.use("/api/v1/store", validateJWT(["vendor"]), vendorIsActive, store);
    app.use("/api/v1/admin", validateJWT(["admin"]), admin);
    app.use("/api/v1/admin/role", validateJWT(["admin"]), role);
    app.use("/api/v1/admin/permission", validateJWT(["admin"]), permission);
    app.use("/api/v1/admin/admin-permission", validateJWT(["admin"]), adminPermission);
    app.use("/api/v1/admin/store", validateJWT(["admin"]), adminStore);
    app.use("/api/v1/category", category);
    app.use("/api/v1/subcategory", subcategory);
    app.use("/api/v1/ad-banner", validateJWT(["admin", "vendor", "customer"]), adBanner);
    app.use("/api/v1/dashboard/user", validateJWT(["admin"]), user);
    app.use(
        "/api/v1/customer",
        validateJWT(["customer"]),
        validateUser<CustomerCache, CustomerRepo>(new CustomerCache(), new CustomerRepo()),
        customer
    );
    app.use("/api/v1/comment/", validateJWT(["customer"]), comment);
    app.use("/api/v1/saved-product/", validateJWT(["customer"]), savedProduct);
    app.use("/api/v1/favorite-store/", validateJWT(["customer"]), favoriteStore);
    app.use("/api/v1/rating/product", validateJWT(["customer"]), productRating);
    app.use("/api/v1/rating/store", validateJWT(["customer"]), storeRating);

    app.get('/greet', async (req: Request, res: Response) => {
        res.status(200).json({ message: "Hello World", error: false });
    });

    // Endpoint to add a job to the queue
    app.get('/add-job', validateJWT(["admin", "vendor", "customer"]), async (req: Request, res: Response) => {
        const clientId = res.locals.data.id;
        const userType = res.locals.userType;

        // Add job to BullMQ queue
        const job = await myQueue.add('processTask', { task: 'example', clientId, userType });

        res.status(200).json({ message: `Job ${job.id} added to queue for client ${clientId}`, error: false });
    });


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

    app.get("/test1", async (req: Request, res: Response, next: NextFunction) => {
        // Publish event to Redis channel 'order:created'
        const event = {
            orderId: 22,
            userId: 2,
            total: 1000,
            createdAt: new Date().toISOString(),
        };

        await streamRouter.addEvent('product', {
            type: 'product:create',
            data: { greet: "Hello" },
        });
        res.status(200).json(event);
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

    app.post("/validate-admin", validateJWT(['admin']), async (req: Request, res: Response, next: NextFunction) => {
        const { requiredPermissions } = req.body;
        const result = await check(res.locals.data, requiredPermissions);

        res.status(result.statusCode).json({
            error: result.error,
            message: result.message,
            data: result.data
        });
        return;
    });


    if (cluster.isPrimary) cronJobs.start();;

    initializeWorkers();
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