import mime from "mime";
import Service from "./Service";
import { http, urls } from "../constants";
import Repository, { ImageRepository } from "../interfaces/Repository";
import { processImage } from "../utils";
import * as fs from "fs";
import ImageRepo from "../repos/ImageRepo";

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

    public unSyncDeleteImages(images: Express.Multer.File[]) {
        for (const image of images) {
            fs.unlinkSync(image.path);
        }
    }

    public async deleteImages(images: Express.Multer.File[]): Promise<boolean> {
        const deletionPromises = images.map (image =>
            fs.promises.unlink(image.path).then(() => ({ success: true, path: image.path, fieldname: image.fieldname }))
                .catch(error => ({ success: false, file: image.path, fieldname: image.fieldname, error }))
        );

        const results = await Promise.all(deletionPromises);

        const errors = results.filter(result => !result.success);
        if (errors.length > 0) {
            console.error("Failed to delete some files:", errors);
            return true; // Indicate that there were errors
        }
        return false; // All deletions succeeded
    }


    public async uploadImage<T extends ImageRepo>(image: Express.Multer.File, parentId: number, baseUrl: string, partImageUrl: string, repo: T) { // TODO: make this function general
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const mimeType = mime.lookup(image.path); // TODO: get this from processImage
        const repoResult = await repo.insertImage({
            mimeType: mimeType,
            picture: result.data,
            parentId: parentId
        });

        const imageUrl = baseUrl + urls("baseImageUrl")! + partImageUrl.split(":")[0] + parentId;

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