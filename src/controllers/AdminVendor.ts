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

        const serviceResult = await AdminVendor.service.getUserProfileWithId(idResult.number);
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

        const serviceResult = await AdminVendor.service.paginateUsers(page, pageSize);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllVendors(req: Request, res: Response) {
        const serviceResult = await AdminVendor.service.getAllUsers();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await AdminVendor.service.totalRecords();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.body.vendorId);

            if (idResult.error) {
                res.status(400).send("Vendor id must be an integer");
                return;
            }

            const serviceResult = activate ? await AdminVendor.service.activateVendor(idResult.number) : await AdminVendor.service.deActivateVendor(idResult.number);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateVendor() {
        return AdminVendor.toggleActivate(false);
    }

    public static activateVendor() {
        return AdminVendor.toggleActivate();
    }
}
