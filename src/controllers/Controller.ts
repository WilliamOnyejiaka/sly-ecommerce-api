import Service from "../services/Service";
import { Request, Response } from "express";

export default class Controller {

    public static paginate<T extends Service>(service: T) {
        return async (req: Request, res: Response) => {
            const { page, pageSize } = req.query;
            console.log(page,pageSize);
            
            const serviceResult = await service.paginate(page as any, pageSize as any);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }
}