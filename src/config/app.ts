import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { auth, vendor, store, seed, admin, role, adminVendor, permission, adminPermission, adminStore, adminCategory, customer } from "./../routes";
import { Cloudinary, Email } from "../services";
import path from "path";
import ejs from "ejs";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware, vendorIsActive, uploads } from "./../middlewares";
import Redis from "ioredis";
import asyncHandler from "express-async-handler";
import { Admin } from "../controllers";
import { VendorCache } from "../cache";
import { Vendor as VendorRepo } from "../repos";
import cors from "cors";
import { baseUrl } from "../utils";
import { urls } from "../constants";


function createApp() {
    const app: Application = express();
    const vendorRepo: VendorRepo = new VendorRepo();
    const vendorCache: VendorCache = new VendorCache();

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
        validateUser<VendorCache, VendorRepo>(vendorCache, vendorRepo),
        vendor
    );
    app.use("/api/v1/store", validateJWT(["vendor"], env("tokenSecret")!), vendorIsActive, store);
    app.use("/api/v1/admin", validateJWT(["admin"], env("tokenSecret")!), admin);
    app.use("/api/v1/admin/role", validateJWT(["admin"], env("tokenSecret")!), role);
    app.use("/api/v1/admin/vendor", validateJWT(["admin"], env("tokenSecret")!), adminVendor);
    app.use("/api/v1/admin/permission", validateJWT(["admin"], env("tokenSecret")!), permission);
    app.use("/api/v1/admin/admin-permission", validateJWT(["admin"], env("tokenSecret")!), adminPermission);
    app.use("/api/v1/admin/store", validateJWT(["admin"], env("tokenSecret")!), adminStore);
    app.use("/api/v1/admin/category", validateJWT(["admin"], env("tokenSecret")!), adminCategory);
    app.use(
        "/api/v1/customer",
        validateJWT(["customer"], env("tokenSecret")!),
        // validateUser<VendorCache, VendorRepo>(vendorCache, vendorRepo),
        customer
    );

    app.post("/test2", async (req: Request, res: Response) => {
        // const result = await Email();
        const email = new Email();
        const templatePath = path.join(__dirname, './../views', "email.ejs");

        const htmlContent = await ejs.renderFile(templatePath, {
            name: "William",
            otpCode: 564909
        });
        const result = await email.sendEmail("Ecommerce Api", "williamonyejiaka20=-021@gmfddfgdfaail.com", "email verification", htmlContent);
        res.status(200).json({
            'error': false,
            'message': result
        });
    });

    app.get("/test1", async (req: Request, res: Response) => {
        logger.error("Hello World");
        res.status(200).json("testing")
    });

    app.post("/cloudinary", uploads.single("image"), async (req: Request, res: Response) => {

        const image = req.file;
        if (!image) {
            res.status(400).json({
                error: true,
                message: "image file missing"
            });
        }
        const filePath = image!.path;
        const service = new Cloudinary();
        const result = await service.uploadImage(filePath, "storeLogo");
        // const url = cloudinary.url('ecommerce-cdn/store-logo/ldmm9oj81qrkggevfsfu',{
        //     transformation:[
        //         {fetch_format: 'auto'},
        //         {quality: 'auto'}
        //     ]
        // })
        res.status(200).json(result);
        // res.status(200).json(url);

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