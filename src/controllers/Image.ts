import constants, { http } from "../constants";
import { ImageRepository } from "../interfaces/Repository";
import { AdminProfilePicture, StoreLogo, VendorProfilePicture } from "../repos";
import FirstBanner from "../repos/FirstBanner";
import SecondBanner from "../repos/SecondBanner";
import { ImageService } from "../services";
import { numberValidator } from "../validators";
import { Request, Response } from "express";

export default class ImageController {

    private static readonly service: ImageService = new ImageService();

    private static getImage<T extends ImageRepository>(imageRepo: T) {

        return async (req: Request, res: Response) => {
            const idResult = numberValidator(req.params.id);

            if (idResult.error) {
                res.status(400).send("id must be an integer");
                return;
            }
            const serviceResult = await ImageController.service.getImage<T>(imageRepo, idResult.number)

            if (serviceResult.json.error) {
                res.status(serviceResult.statusCode).send(serviceResult.statusCode === 500 ? http("500") : constants("404Image"));
                return;
            }

            res.writeHead(serviceResult.statusCode, {
                'Content-Type': serviceResult.json.data.mimeType,
                'Content-Length': serviceResult.json.data.bufferLength
            })
                .end(serviceResult.json.data.imageBuffer);
        }
    }

    public static getVendorProfilePic() {
        return ImageController.getImage<VendorProfilePicture>(new VendorProfilePicture());
    }

    public static getStoreLogo() {
        return ImageController.getImage<StoreLogo>(new StoreLogo());
    }

    public static getFirstStoreBanner() {
        return ImageController.getImage<FirstBanner>(new FirstBanner());
    }

    public static getSecondStoreBanner() {
        return ImageController.getImage<SecondBanner>(new SecondBanner());
    }

    public static getAdminProfilePic() {
        return ImageController.getImage<AdminProfilePicture>(new AdminProfilePicture());
    }
}