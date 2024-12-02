import Service from "../services/Service";
import { numberValidator } from "../validators";
import { Request, Response } from "express";


export default class Controller {

    public static paginate<T extends Service>(service: T) {
        return async (req: Request, res: Response) => {
            const pageResult = numberValidator(req.query.page);
            if (pageResult.error) {
                res.status(400).json({
                    error: true,
                    message: "page must be an integer"
                });
                return;
            }

            const pageSizeResult = numberValidator(req.query.pageSize);
            if (pageSizeResult.error) {
                res.status(400).json({
                    error: true,
                    message: "pageSize must be an integer"
                });
                return;
            }

            const page = pageResult.number;
            const pageSize = pageSizeResult.number;

            const serviceResult = await service.paginate(page, pageSize);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }
}