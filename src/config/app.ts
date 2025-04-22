import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger, redisBull, redisPub, redisSub, cronJobs } from ".";
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
    dashboardCategory,
    customer,
    category,
    dashboardSubCategory,
    subcategory,
    adBanner,
    user,
    storeFollower
} from "./../routes";
import { validateJWT, validateUser, handleMulterErrors, secureApi, vendorIsActive } from "./../middlewares";
import asyncHandler from "express-async-handler";
import { Admin } from "../controllers";
import { CustomerCache, VendorCache } from "../cache";
import { Vendor as VendorRepo, Customer as CustomerRepo } from "../repos";
import cors from "cors";
import axios from 'axios';
import { http } from "../constants";
import { Admin as AdminService } from "../services";
import streamRouter from "./redisStream";
import cluster from "cluster";
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { myQueue, uploadQueue } from "./bullmq";
import { CompletedJob, FailedJob, IWorker } from "../types";
import { MyWorker } from "../workers/MyWorker";
import { completedJob } from "../workers";
import { Upload } from "../workers/Upload";

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

    app.use("/api/v1/store/follow", storeFollower);
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
    app.use(
        "/api/v1/customer",
        validateJWT(["customer"], env("tokenSecret")!),
        validateUser<CustomerCache, CustomerRepo>(new CustomerCache(), new CustomerRepo()),
        customer
    );

    const IWorkers: IWorker<any>[] = [
        new MyWorker(),
        new Upload()
    ];

    for (const IWorker of IWorkers) {
        const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
        const queueEvents = new QueueEvents(IWorker.queueName, { ...IWorker.config });

        if (IWorker.completed) {
            queueEvents.on('completed', IWorker.completed.bind(IWorker));
        } else {
            queueEvents.on('completed', async ({ jobId, returnvalue }: CompletedJob) => {
                const job = await IWorker.queue.getJob(jobId);
                await completedJob(job, IWorker.eventName, jobId, returnvalue);
            });
        }

        if (IWorker.failed) {
            queueEvents.on('failed', IWorker.failed.bind(IWorker));
        } else {
            queueEvents.on('failed', async ({ jobId, failedReason }: FailedJob) => {
                const job = await IWorker.queue.getJob(jobId);
                await completedJob(job, IWorker.eventName, jobId, failedReason);
            });
        }
        if (IWorker.drained) queueEvents.on('drained', IWorker.drained.bind(IWorker));
    }

    // SSE Endpoint
    app.get('/SSE', validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), async (req: Request, res: Response) => {
        // Connection limit
        // const MAX_CLIENTS = 10000;
        // const clientCount = await redisClient.dbsize(); // Approximate client count
        // if (clientCount >= MAX_CLIENTS) {
        //     res.status(503).json({ error: 'Server at capacity' });
        //     return;
        // }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const clientId = res.locals.data.id;
        const userType = res.locals.userType;

        // Store client in Redis with TTL (1 hour)
        // TODO: use redis pipeline
        const pipeline = redisBull.pipeline();
        pipeline.hset(`client:${userType}:${clientId}`, {
            active: 'true',
            jobIds: JSON.stringify([]),
        });
        pipeline.expire(`client:${userType}:${clientId}`, 3600); // TODO: whats the point. Expire in 1 hour
        await pipeline.exec();

        // Subscribe to client-specific Redis channel
        redisSub.subscribe(`job:${userType}:${clientId}`, (err) => {
            if (err) {
                console.error(`Failed to subscribe to job:${userType}:${clientId}:`, err);
                res.end();
            }
        });

        redisSub.on('message', (channel, message) => {
            if (channel === `job:${userType}:${clientId}`) {
                const { event, ...data } = JSON.parse(message);
                res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            }
        });

        // Send welcome message
        res.write(`event: connection\ndata: {"message": "User - ${clientId} has connected successfuly"}\n\n`);

        // Clean up on client disconnect
        req.on('close', async () => {
            await redisSub.unsubscribe(`job:${userType}:${clientId}`);
            await redisBull.del(`client:${userType}:${clientId}`);
            res.end();
        });
    });

    // Endpoint to add a job to the queue
    app.get('/add-job', validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), async (req: Request, res: Response) => {
        const clientId = res.locals.data.id;
        const userType = res.locals.userType;
        if (!clientId) {
            res.status(400).json({ error: 'Missing clientId' });
            return;
        }

        // Add job to BullMQ queue
        const job = await myQueue.add('processTask', { task: 'example', clientId, userType });

        // Update client's job list in Redis
        const jobIdsStr = await redisBull.hget(`client:${userType}:${clientId}`, 'jobIds');
        const jobIds: any[] = jobIdsStr ? JSON.parse(jobIdsStr) : [];
        jobIds.push(job.id);
        await redisBull.hset(`client:${userType}:${clientId}`, 'jobIds', JSON.stringify(jobIds));

        res.json({ message: `Job ${job.id} added to queue for client ${clientId}` });
    });

    async function updateClientJobs(jobId: any, userType: string, clientId: number) {
        try {
            const jobIdsStr = await redisBull.hget(`client:${userType}:${clientId}`, 'jobIds');
            const jobIds: any[] = jobIdsStr ? JSON.parse(jobIdsStr) : [];
            jobIds.push(jobId);
            await redisBull.hset(`client:${userType}:${clientId}`, 'jobIds', JSON.stringify(jobIds));
            return true;
        } catch (error) {
            return false;
        }
    }

    app.get('/upload-image', validateJWT(["admin", "vendor", "customer"], env("tokenSecret")!), async (req: Request, res: Response) => {
        const clientId = res.locals.data.id;
        const userType = res.locals.userType;

        // Add job to BullMQ queue
        const job = await uploadQueue.add('uploadImage', { imageUrl: 'cloudinary.com', clientId, userType });
        const jobId = job.id;

        // Update client's job list in Redis
        const updated = await updateClientJobs(jobId, userType, clientId);
        if (!updated) {
            res.status(500).json({
                error: true,
                message: "failed to add job"
            });
            return;
        }

        res.status(200).json({ message: `Job ${jobId} added to queue for client ${clientId}` });
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

        await streamRouter.addEvent('user', {
            type: 'Jest',
            data: { greet: "Hello" },
        });
        res.status(200).json(event)
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

    if (cluster.isPrimary) {
        cronJobs.start();
    }

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