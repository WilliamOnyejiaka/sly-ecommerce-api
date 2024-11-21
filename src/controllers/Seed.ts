import { Request, Response } from "express";
import { Seed as SeedService } from "./../services";

export default class Seed {

    public static async defaultRoles(req: Request, res: Response) {
        const serviceResult = await SeedService.defaultRoles();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async defaultPermissions(req: Request, res: Response) {
        const serviceResult = await SeedService.defaultPermissions();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async defaultRolePermissions(req: Request, res: Response) {

    }

}