import mime from "mime";
import Service from "./Service";
import { http, urls } from "../constants";
import Repository, { ImageRepository } from "../interfaces/Repository";
import { processImage, baseUrl } from "../utils";
import * as fs from "fs";

export default class ImageService extends Service {

    public constructor() {
        super();
    }

    public async getImage<T extends ImageRepository>(repo: T, id: number) {        
        const repoResult = await repo.getImage(id);
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const statusCode = repoResult.data ? 200 : 404;
        const error: boolean = repoResult.data ? false : true;

        if (repoResult.data) {
            const imageBuffer = Buffer.from((repoResult.data as any).picture, 'base64');

            return super.responseData(statusCode, error, null, {
                imageBuffer: imageBuffer,
                bufferLength: imageBuffer.length,
                mimeType: (repoResult.data as any).mimeType
            });
        }

        return super.responseData(statusCode, error, null, repoResult.data);
    }

    public async deleteImages(images: Express.Multer.File[]) {
        for (const image of images) {
            fs.unlinkSync(image.path);
        }
    }

    public async uploadImage<T extends Repository>(image: Express.Multer.File, data: any,repo: T,id: number,imageRoute: string){
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        data.mimeType = mime.lookup(image.path);
        data.picture = result.data;
        const repoResult = await repo.insert(data);

        const imageUrl = baseUrl + urls("baseImageUrl")! + imageRoute.split(":")[0] + id;

        return repoResult ?
            super.responseData(
                201,
                false,
                "Image was uploaded successfully",
                { imageUrl: imageUrl }
            ) :
            super.responseData(
                500,
                true,
                http("500")!,
            );
    }
}