import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { corsConfig, env } from ".";
import { auth } from "./../routes";
import { Email } from "../services";
import path from "path";
import ejs from "ejs";
import { validateJWT, validateUser, handleErrors ,secureApi, redisClientMiddleware} from "./../middlewares";
import Redis from "ioredis";

function createApp() {
    const app: Application = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(corsConfig);
    app.use(express.json());
    app.use(morgan("combined"));
    // app.use(redisClientMiddleware);
    // app.use(secureApi); TODO: uncomment this
    app.use("/api/v1/auth", auth);

    app.post("/test2", async (req: Request, res: Response) => {
        // const result = await Email();
        const email = new Email();
        const templatePath = path.join(__dirname, './../views', "email.ejs");
        
        const htmlContent = await ejs.renderFile(templatePath, {
            name: "William",
            otpCode: 564909
        });
        const result = await email.sendEmail("Ecommerce Api","williamonyejiaka20=-021@gmfddfgdfaail.com","email verification",htmlContent);
        res.status(200).json({
            'error': false,
            'message': result
        });
    });



    app.get("/test1",async (req: Request, res: Response) => {
        const redisClient: Redis = res.locals.redisClient;
        try{
            await redisClient.set("user", JSON.stringify("hello World"));

            const data = await redisClient.get("user");
            console.log(data);
            
            res.status(200).json({
                'error': false,
                'message': data
            });
        }catch(error){
            console.error(error);
            res.status(200).json({
                'error': false,
                'message': "error"
            });
        }


        
    });

    // app.use(handleErrors);

    return app;
}


export default createApp;