import mime from "mime";
import Service from ".";
import { http, urls } from "../constants";
import Repository, { ImageRepository } from "../interfaces/Repository";
import { processImage, baseUrl } from "../utils";
import * as fs from "fs";

export default class ImageService {

    public static async getImage<T extends ImageRepository>(repo: T, id: number) {        
        const repoResult = await repo.getImage(id)
        if (repoResult.error) {
            return Service.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

            return Service.responseData(statusCode, error, null, {
                imageBuffer: imageBuffer,
                bufferLength: imageBuffer.length,
                mimeType: (repoResult.data as any).mimeType
            });
        }

        return Service.responseData(statusCode, error, null, repoResult.data);
    }

    public static async deleteImages(images: Express.Multer.File[]) {
        for (const image of images) {
            fs.unlinkSync(image.path);
        }
    }

    public async uploadProfilePic<T extends Repository>(image: Express.Multer.File, data: any,repo: T,id: number){
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        data['mimeType'] = mime.lookup(image.path);
        const repoResult = await repo.insert(data);

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("vendorPic")!.split(":")[0] + id;

        return repoResult ?
            Service.responseData(
                201,
                false,
                "Profile picture was created successfully",
                { imageUrl: imageUrl }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }
}