import { Request, Response } from "express";
import { Admin as AdminService, ImageService } from "../services";
import { emailValidator, numberValidator, phoneNumberValidator } from "../validators";
import { baseUrl } from "../utils";
import { AdminDto } from "../types/dtos";
import constants from "../constants";
import { AdminProfilePicture } from "../repos";
import { Controller } from ".";
import { validationResult } from "express-validator";

export default class Admin {

    private static readonly service: AdminService = new AdminService();
    public static readonly imageService: ImageService = new ImageService();

    public static async defaultAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const roleId = Number(req.params.roleId);
        const serviceResult = await Admin.service.defaultAdmin(roleId);
        Controller.response(res, serviceResult);
    }

    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const adminId = Number(res.locals.data.id);

        const serviceResult = await Admin.imageService.uploadImage<AdminProfilePicture>(
            image,
            adminId,
            new AdminProfilePicture(),
            'adminProfilePic'
        );
        Controller.response(res, serviceResult);
    }

    public static async getAdmin(req: Request, res: Response) {
        const adminEmail = res.locals.data.email;
        const serviceResult = await Admin.service.getAdminWithEmail(adminEmail);
        Controller.response(res, serviceResult);
    }

    public static async getAdminAndRole(req: Request, res: Response) {
        const id = Number(res.locals.data.id);
        const serviceResult = await Admin.service.getAdminAndRole(id);
        Controller.response(res, serviceResult);
    }

    public static async createAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const createData: AdminDto = req.body;
        const adminName = res.locals.data.firstName + " " + res.locals.data.lastName; // ! TODO: get from cache
        const serviceResult = await Admin.service.createAdmin(createData, adminName);
        Controller.response(res, serviceResult);
    }

    public static async generateSignUpKey(req: Request, res: Response) {
        const id = Number(res.locals.data.id);
        const adminName = res.locals.data.firstName + " " + res.locals.data.lastName; // TODO: change createdBy to parent admin - INT
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const roleId = Number(req.params.roleId);
        const serviceResult = await Admin.service.generateAdminSignUpKey(roleId, adminName);
        Controller.response(res, serviceResult);
    }

    public static async deleteAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = Number(req.params.adminId);
        const serviceResult = await Admin.service.deleteAdmin(adminId);
        Controller.response(res, serviceResult);
    }

    public static async deleteSelf(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = Number(res.locals.id);
        const serviceResult = await Admin.service.deleteAdmin(adminId);
        Controller.response(res, serviceResult);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {

            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const adminId = Number(req.body.adminId);

            const serviceResult = activate ? await Admin.service.activateAdmin(adminId) : await Admin.service.deactivateAdmin(adminId);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateAdmin() {
        return Admin.toggleActivate(false);
    }

    public static activateAdmin() {
        return Admin.toggleActivate();
    }

    public static async assignRole(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const roleId = Number(req.body.roleId);
        const adminId = Number(req.body.adminId);

        const serviceResult = await Admin.service.assignRole(adminId, roleId);
        Controller.response(res, serviceResult);
    }
}