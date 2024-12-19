import Service from "./Service";
import { http } from "../constants";
import { compressImage } from "../utils";
import * as fs from "fs";
import ImageRepo from "../repos/ImageRepo";
import { logger } from "../config";
import { Cloudinary } from ".";

const bytesToKB = (bytes: number) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB

export default class ImageService extends Service {

    public constructor() {
        super();
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

    private async processAndUpload(image: Express.Multer.File, imageFolder: string) {
        const result = await compressImage(image);

        if (result.error) {
            return super.responseData(
                500,
                true,
                http("500")!,
            );
        }

        const deleted = await this.deleteImages([image]);
        if (deleted) {
            return super.responseData(500, true, http('500')!);
        }

        const cloudinary = new Cloudinary();
        const uploadResult = await cloudinary.uploadImage(result.outputPath!, imageFolder);
        return uploadResult;
    }

    public async uploadImage<T extends ImageRepo>(image: Express.Multer.File, parentId: number, repo: T, imageFolder: string) {
        const imageExists = await repo.getImage(parentId);
        if (imageExists.error) {
            await this.deleteImages([image]);
            return super.responseData(imageExists.type, true, imageExists.message!);
        }

        if (imageExists.data) {
            await this.deleteImages([image]);
            return super.responseData(400, true, "A record with this data already exists.");
        }

        const uploadResult = await this.processAndUpload(image, imageFolder);

        const repoResult = await repo.insertImage({
            mimeType: uploadResult.json.data.imageData.format,
            imageUrl: uploadResult.json.data.url,
            publicId: uploadResult.json.data.imageData.public_id,
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