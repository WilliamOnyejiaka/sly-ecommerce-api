import { AdBanner as AdBannerService } from "../services";
import { Request, Response } from "express";
import Controller from "./bases/Controller";
import { validationResult } from "express-validator";
import { numberValidator } from "../validators";

export default class AdBanner extends Controller {

    private static readonly service: AdBannerService = new AdBannerService();

    public static async createAll(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const image = req.file!;
        const bannerDetails = req.body;
        const serviceResult = await AdBanner.service.createAdBannerAll(bannerDetails, image);
        Controller.response(res, serviceResult);
    }

    public static async getWithId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("AdBanner id must be an integer");
            return;
        }
        const serviceResult = await AdBanner.service.getAdBannerWithId(idResult.number);
        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.id);

        if (idResult.error) {
            res.status(400).send("AdBanner id must be an integer");
            return;
        }
        const serviceResult = await AdBanner.service.deleteItem(idResult.number);
        Controller.response(res, serviceResult);
    }

}