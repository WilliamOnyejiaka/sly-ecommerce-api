import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { corsConfig, env } from ".";
import { auth } from "./../routes";
// import { validateJWT, validateUser, handleErrors } from "./middlewares";

function createApp() {
    const app: Application = express();

    app.use(express.urlencoded({ extended: true }));
    // app.use(corsConfig);
    app.use(express.json());
    app.use(morgan("combined"));
    app.use("/api/v1/auth", auth);

    app.post("/test2", async (req: Request, res: Response) => {
        // const newUser = await prisma.animal.create({data: req.body});
        // res.json(newUser);
    });



    app.get("/test1",async (req: Request, res: Response) => {
        // res.status(200).json({
        //     'error': false,
        //     'message': process.pid
        // });

        // const allAnimals = await prisma.animal.findMany();
        // res.json(allAnimals);
    });

    // app.use(handleErrors);

    return app;
}


export default createApp;