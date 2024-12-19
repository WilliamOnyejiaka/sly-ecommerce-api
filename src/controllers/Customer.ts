import { urls } from "../constants";
import { CustomerProfilePic } from "../repos";
import { baseUrl } from "../utils";
import { Customer as CustomerService, ImageService } from "./../services";
import { Request, Response } from "express";


export default class Customer {

    private static readonly service: CustomerService = new CustomerService();
    public static readonly imageService: ImageService = new ImageService();

    public static async uploadProfilePic(req: Request, res: Response) {
        const image = req.file!;
        const customerId = Number(res.locals.data.id);

        const serviceResult = await Customer.imageService.uploadImage<CustomerProfilePic>(
            image,
            customerId,
            new CustomerProfilePic(),
            'customerProfilePic'
        );
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getCustomerAll(req: Request, res: Response) {
        const customerId = Number(res.locals.data.id);
        const serviceResult = await Customer.service.getUserProfileWithId(customerId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}