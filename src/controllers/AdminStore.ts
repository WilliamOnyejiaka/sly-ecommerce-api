import { AdminStore as AdminStoreService } from "../services";
import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { baseUrl } from "../utils";

export default class AdminStore {

    private static readonly service: AdminStoreService = new AdminStoreService();

    public static async retrieveVendorStore(req: Request, res: Response) {
        const idResult = numberValidator(req.params.vendorId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await AdminStore.service.retreiveVendorStore(idResult.number, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}