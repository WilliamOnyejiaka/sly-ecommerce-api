import BaseService from "./bases/BaseService";
import ImageRepo from "../repos/bases/ImageRepo";
import { Cloudinary } from ".";
import { UploadedImageData, UploadResult } from "../types";
import { CdnFolders, ResourceType } from "../types/enums";

const bytesToKB = (bytes: number) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB

export default class ImageService extends BaseService {

    private readonly cloudinary = new Cloudinary();

    public constructor() {
        super();
    }

    public async uploadImage<T extends ImageRepo>(image: Express.Multer.File, parentId: number, repo: T, fileFolder: CdnFolders, validated: boolean = false) {
        if (!validated) {
            const imageExists = await repo.getImage(parentId);
            const imageExistsError = this.handleRepoError(imageExists);
            if (imageExistsError) return imageExistsError;

            if (imageExists.data) return super.responseData(400, true, "A record with this data already exists.");

        }

        const { uploadedFiles, failedFiles, publicIds } = await this.cloudinary.upload([image], ResourceType.IMAGE, fileFolder);

        if (uploadedFiles.length > 0) {
            const uploadedFile = uploadedFiles[0];
            const repoResult = await repo.insertImage({
                mimeType: uploadedFile.mimeType,
                imageUrl: uploadedFile.url,
                publicId: uploadedFile.publicId,
                size: Number(uploadedFile.size),
                parentId: parentId
            });
            const repoResultError = this.handleRepoError(repoResult);
            if (repoResultError) {
                const deletedResult = await this.cloudinary.delete(publicIds[0]);
                if (deletedResult.json.error) return deletedResult;
                return repoResultError
            };
            return super.responseData(201, false, "Image was uploaded successfully", { imageUrl: uploadedFile.url });
        }
        return super.responseData(500, true, "Something went wrong", failedFiles);
    }

    public async uploadImages(images: Express.Multer.File[], uploadFolders: Record<string, CdnFolders>): Promise<UploadResult> {
        try {
            // Parallelize image uploads
            const uploadPromises = images.map(async (image) => {
                const fieldName = image.fieldname as CdnFolders;
                const uploadFolder = uploadFolders[fieldName];

                const { uploadedFiles, failedFiles } = await this.cloudinary.upload([image], ResourceType.IMAGE, uploadFolder as any);

                if (uploadedFiles.length > 0) {
                    const uploadedFile = uploadedFiles[0];
                    return {
                        success: true,
                        fieldName,
                        data: {
                            mimeType: uploadedFile.mimeType,
                            imageUrl: uploadedFile.url,
                            publicId: uploadedFile.publicId,
                            size: Number(uploadedFile.size),
                        },
                    };
                }

                return {
                    success: false,
                    fieldName,
                    message: failedFiles[0].error,
                };
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);

            // Separate successful uploads and errors
            const successfulUploads = results.filter((result) => result.success) as {
                success: true;
                fieldName: string;
                data: UploadedImageData;
            }[];

            const errors = results.filter((result) => !result.success) as {
                success: false;
                fieldName: string;
                message: string;
            }[];

            // Construct the storeImages object
            const uploadedImages = successfulUploads.reduce((acc, { fieldName, data }) => {
                acc[fieldName] = data;
                return acc;
            }, {} as Record<string, UploadedImageData>);

            const publicIds = successfulUploads.map(upload => upload.data.publicId);

            if (errors.length > 0) {
                if (successfulUploads.length >= 1) {
                    const deleted = await this.cloudinary.deleteFiles(publicIds);
                    if (deleted.json.error) return { success: false, error: [{ fieldName: "unknown", message: "Something went wrong" }] };
                }
                return {
                    success: false,
                    error: errors.map((e) => ({ fieldName: e.fieldName, message: e.message })),
                };
            }

            return { success: true, data: uploadedImages, publicIds };
        } catch (error: any) {
            console.log(error);
            return {
                success: false,
                error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
            };
        }
    }

    public async deleteImages(publicIDs: string[]) {
        return await this.cloudinary.deleteFiles(publicIDs)
    }
}