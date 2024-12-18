import { Request, Response } from "express";
import { Customer as CustomerService } from "../services";
import { numberValidator } from "../validators";
import constants, { http } from "../constants";
import { baseUrl } from "../utils";

export default class AdminCustomer {

    private static readonly service: CustomerService = new CustomerService();

    // public static async getVendor(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.vendorId);

    //     if (idResult.error) {
    //         res.status(400).json({
    //             error: true,
    //             message: "id must be an integer"
    //         });
    //         return;
    //     }

    //     const baseServerUrl = baseUrl(req);
    //     const serviceResult = await AdminCustomer.service.getVendorAll(idResult.number, baseServerUrl);
    //     res.status(serviceResult.statusCode).json(serviceResult.json);
    // }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.id);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const serviceResult = await AdminCustomer.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    // public static async paginateVendors(req: Request, res: Response) {
    //     const pageResult = numberValidator(req.query.page);

    //     if (pageResult.error) {
    //         res.status(400).json({
    //             error: true,
    //             message: "page must be an integer"
    //         });
    //         return;
    //     }

    //     const pageSizeResult = numberValidator(req.query.pageSize);
    //     if (pageSizeResult.error) {
    //         res.status(400).json({
    //             error: true,
    //             message: "pageSize must be an integer"
    //         });
    //         return;
    //     }

    //     const page = pageResult.number;
    //     const pageSize = pageSizeResult.number;

    //     const serviceResult = await AdminCustomer.service.paginateVendors(page, pageSize);
    //     res.status(serviceResult.statusCode).json(serviceResult.json);
    // }

    public static async getAllVendors(req: Request, res: Response) {
        const serviceResult = await AdminCustomer.service.getAllCustomers();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await AdminCustomer.service.totalRecords();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.body.vendorId);

            if (idResult.error) {
                res.status(400).send("Customer id must be an integer");
                return;
            }

            const serviceResult = activate ? await AdminCustomer.service.activateCustomer(idResult.number) : await AdminCustomer.service.deActivateCustomer(idResult.number);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateCustomer() {
        return AdminCustomer.toggleActivate(false);
    }

    public static activateCustomer() {
        return AdminCustomer.toggleActivate();
    }
}
