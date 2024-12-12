import { Request, Response } from "express";
import { Admin as AdminService } from "../services";
import { emailValidator, numberValidator, phoneNumberValidator } from "../validators";
import { baseUrl } from "../utils";
import { AdminDto } from "../types/dtos";
import constants from "../constants";

export default class Admin {

    private static readonly service: AdminService = new AdminService();

    public static async defaultAdmin(req: Request, res: Response) {
        const idResult = numberValidator(req.params.roleId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "Id must be an integer",
                data: {}
            });
            return;
        }
        const serviceResult = await Admin.service.defaultAdmin(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


    public static async uploadProfilePicture(req: Request, res: Response) {
        const image = req.file!;
        const vendorId = Number(res.locals.data.id);
        const baseServerUrl = baseUrl(req);
        const serviceResult = await Admin.service.uploadProfilePicture(image, vendorId, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAdmin(req: Request, res: Response) {
        const adminEmail = res.locals.data.email;
        const serviceResult = await Admin.service.getAdminWithEmail(adminEmail);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAdminAndRole(req: Request, res: Response) {
        const id = Number(res.locals.data.id);
        const serviceResult = await Admin.service.getAdminAndRole(id);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createAdmin(req: Request, res: Response) {
        const createData: AdminDto = req.body;

        const phoneNumberIsValid = phoneNumberValidator(createData.phoneNumber!);

        if (phoneNumberIsValid !== null) {
            res.status(400).json({
                error: true,
                message: phoneNumberIsValid
            });
            return;
        }

        if (!emailValidator(createData.email)) {
            res.status(400).json({
                error: true,
                message: constants('400Email')!
            });
            return;
        }

        const emailExistsResult = await Admin.service.emailExists(createData.email);
        if (emailExistsResult.json.error) {
            res.status(emailExistsResult.statusCode).json(emailExistsResult.json);
            return;
        }
        const adminName = res.locals.data.firstName + " " + res.locals.data.lastName;
        const serviceResult = await Admin.service.createAdmin(createData, adminName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteAdmin(req: Request, res: Response) {
        const idResult = numberValidator(req.params.adminId);

        if (idResult.error) {
            res.status(400).send("Id must be an integer");
            return;
        }

        const serviceResult = await Admin.service.deleteAdmin(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.body.adminId);

            if (idResult.error) {
                res.status(400).send("Admin id must be an integer");
                return;
            }

            const serviceResult = activate ? await Admin.service.activateAdmin(idResult.number) : await Admin.service.deactivateAdmin(idResult.number);
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
        const idResult = numberValidator(req.body.adminId);

        if (idResult.error) {
            res.status(400).send("Admin id must be an integer");
            return;
        }

        const roleIdResult = numberValidator(req.body.roleId);

        if (roleIdResult.error) {
            res.status(400).send("Role id must be an integer");
            return;
        }
        const roleExistsResult = await Admin.service.getRoleWithId(roleIdResult.number);
        if (roleExistsResult.json.error) {
            res.status(roleExistsResult.statusCode).json(roleExistsResult.json);
            return;
        }

        const serviceResult = await Admin.service.assignRole(idResult.number, roleIdResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}