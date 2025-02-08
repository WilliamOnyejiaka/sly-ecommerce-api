import { Request, Response } from "express";
import { UserManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import VendorDto, { AdminDto, CustomerAddressDto, CustomerDto } from "../types/dtos";

export default class UserManagement {

    private static readonly facade: UserManagementFacade = new UserManagementFacade();

    public static async createCustomer(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const addressDto: CustomerAddressDto = {
            zip: req.body.zip,
            street: req.body.street,
            city: req.body.city
        }

        const serviceResult = await UserManagement.facade.createCustomer({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }, addressDto);
        Controller.response(res, serviceResult);
    }

    public static async createVendor(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const createData: VendorDto = req.body;
        const serviceResult = await UserManagement.facade.createVendor(createData);
        Controller.response(res, serviceResult);
    }

    public static async createAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const createData: AdminDto = req.body;
        const createdBy = Number(res.locals.data.id);
        const serviceResult = await UserManagement.facade.createAdmin(createData, createdBy);
        Controller.response(res, serviceResult);
    }

    public static async generateSignUpKey(req: Request, res: Response) {
        const createdBy = Number(res.locals.data.id);
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const roleId = Number(req.params.roleId);
        const serviceResult = await UserManagement.facade.generateAdminSignUpKey(roleId, createdBy);
        Controller.response(res, serviceResult);
    }

    public static getUser(user: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const userId = Number(req.params.id);

            console.log(userId);


            const facadeResult = await UserManagement.facade.getUserProfileWithId(userId, user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        }
    }

    public static delete(user: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const userId = Number(req.params.userId);
            const facadeResult = await UserManagement.facade.deleteUser(userId, user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        }
    }

    public static paginateUsers(user: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const page = Number(req.query.page);
            const pageSize = Number(req.query.pageSize);

            const facadeResult = await UserManagement.facade.paginateUsers(page, pageSize, user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        };
    }

    public static getAllUsers(user: UserType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await UserManagement.facade.getAllUsers(user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        };
    }

    public static totalRecords(user: UserType) {
        return async (req: Request, res: Response) => {
            const facadeResult = await UserManagement.facade.totalUsers(user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        };
    }
    public static toggleActivate(user: UserType, activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const userId = Number(req.body.id);
            const facadeResult = activate ? await UserManagement.facade.activateUser(userId, user) : await UserManagement.facade.deactivateUser(userId, user);
            res.status(facadeResult.statusCode).json(facadeResult.json);
        }
    }

    public static deactivateUser(user: UserType) {
        return UserManagement.toggleActivate(user, false);
    }

    public static activateUser(user: UserType) {
        return UserManagement.toggleActivate(user);
    }
}
