import mime from "mime";
import Service from "./Service";
import { http, urls } from "../constants";
import Repository, { ImageRepository } from "../interfaces/Repository";
import { processImage } from "../utils";
import * as fs from "fs";
import ImageRepo from "../repos/ImageRepo";
import sharp from "sharp";
import { logger } from "../config";
import { Cloudinary } from ".";

async function compressImage(image: Express.Multer.File) {
    try {
        const outputPath = `compressed/${image.filename}`;
        const result = await sharp(image.path)
            .webp({ lossless: true })
            .toFile(outputPath);

        return {
            error: false,
            outputPath: outputPath
        }
    } catch (error) {
        logger.error(`Error processing the image: ${error}`);
        return {
            error: true,
            outputPath: null
        }
    }
}

export default class ImageService extends Service {

    public constructor() {
        super();
    }

    public async getImage<T extends ImageRepository>(repo: T, id: number) {
        const repoResult = await repo.getImage(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
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
        const deletionPromises = images.map(image =>
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




    public async uploadImage<T extends ImageRepo>(image: Express.Multer.File, parentId: number, baseUrl: string, partImageUrl: string, repo: T) {
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

        return !repoResult.error ?
            super.responseData(
                201,
                false,
                "Image was uploaded successfully",
                { imageUrl: imageUrl }
            ) :
            super.responseData(repoResult.type, true, repoResult.message as string);

    }

    public async uploadImageV2<T extends ImageRepo>(image: Express.Multer.File, parentId: number, repo: T, imageFolder: string) {
        const result = await compressImage(image);

        if (result.error) {
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const cloudinary = new Cloudinary();
        const uploadResult = await cloudinary.uploadImage(result.outputPath!, imageFolder);
        const deleted = await this.deleteImages([image]);

        if (deleted) {
            return super.responseData(500, true, http('500')!);
        }

        if (uploadResult.json.error) {
            return uploadResult;
        }

        const repoResult = await repo.insertImage({
            mimeType: uploadResult.json.data.imageData.format,
            imageUrl: uploadResult.json.data.url,
            publicId: uploadResult.json.data.imageData.public_id,
            folder: uploadResult.json.data.imageData.folder,
            size: uploadResult.json.data.imageData.bytes,
            parentId: parentId
        });


        return !repoResult.error ?
            super.responseData(
                201,
                false,
                "Image was uploaded successfully",
                { imageUrl: uploadResult.json.data.url }
            ) :
            super.responseData(repoResult.type, true, repoResult.message as string);

    }

}