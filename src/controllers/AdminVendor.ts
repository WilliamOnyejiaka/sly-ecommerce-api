import { Request, Response } from "express";
import { Vendor as VendorService } from "../services";
import { numberValidator } from "../validators";
import constants, { http } from "../constants";
import { baseUrl } from "../utils";

export default class AdminVendor {

    private static readonly service: VendorService = new VendorService();

    public static async getVendor(req: Request, res: Response) {
        const idResult = numberValidator(req.params.vendorId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await AdminVendor.service.getVendorAll(idResult.number, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.vendorId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const serviceResult = await AdminVendor.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateVendors(req: Request, res: Response) {
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

        const serviceResult = await AdminVendor.service.paginateVendors(page, pageSize);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllVendors(req: Request, res: Response) {
        const serviceResult = await AdminVendor.service.getAllVendors();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}
