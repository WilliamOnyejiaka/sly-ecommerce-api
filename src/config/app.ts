import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { corsConfig, env } from ".";
import { auth, vendor, store, image } from "./../routes";
import { Email } from "../services";
import path from "path";
import ejs from "ejs";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware } from "./../middlewares";
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

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined"));
    app.use(urls("baseImageUrl")!,image);
    // app.use(secureApi); TODO: uncomment this
    app.use("/api/v1/auth", auth);
    app.use(
        "/api/v1/vendor",
        validateJWT(["vendor"], env("tokenSecret")!),
        validateUser<VendorCache, VendorRepo>(vendorCache, vendorRepo),
        vendor
    );
    app.use("/api/v1/store", validateJWT(["vendor"], env("tokenSecret")!), store);
    app.get("/api/v1/admin/default-admin", asyncHandler(Admin.defaultAdmin));
    app.use("/api/v1/admin", validateJWT(["superAdmin"], env("tokenSecret")!), store);


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
        const image = "/vendor/profile-pic/:vendorId".split(":");
        res.json(image);
    });

    app.use(handleMulterErrors);
    return app;
}


export default createApp;