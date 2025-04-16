import { cloudinary, logger } from "../config";
import BaseService from "./bases/BaseService";
import { http, imageFolders } from "../constants";
import { CdnFolders, ResourceType } from "../types/enums";
import { UploadedFiles, FailedFiles } from "../types";
import { compressImage } from "../utils";

export default class Cloudinary extends BaseService {

    public constructor() {
        super();
    }

    private getUrl(publicId: string) {
        return cloudinary.url(publicId, {
            transformation: [
                { fetch_format: 'auto' },
                { quality: 'auto' }
            ]
        });
    }

    public async upload(files: Express.Multer.File[], resourceType: ResourceType, folder: CdnFolders) {
        const uploadedFiles: UploadedFiles[] = [];
        const failedFiles: FailedFiles[] = [];
        const publicIds: string[] = [];

        await Promise.all(
            files.map(async (file) => {
                try {
                    const buffer = resourceType === ResourceType.IMAGE ? await compressImage(file) : { error: false, buffer: file.buffer };
                    if (!buffer.error) {
                        const result: any = await new Promise((resolve, reject) => {
                            const baseDetails = {
                                resource_type: resourceType,
                                folder: folder,
                                timeout: 100000,
                            };
                            const uploadStreamDetails = resourceType === ResourceType.VIDEO ?
                                {
                                    ...baseDetails,
                                    eager: [
                                        { format: "jpg", transformation: [{ width: 300, height: 200, crop: "thumb", start_offset: "auto" }] }
                                    ]
                                } : baseDetails;

                            const stream = cloudinary.uploader.upload_stream(
                                uploadStreamDetails,
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(buffer.buffer);
                        });

                        const thumbnail = resourceType === ResourceType.VIDEO && result.eager ? result.eager[0].secure_url : null;
                        const url = resourceType === ResourceType.IMAGE ? this.getUrl(result.public_id) : result.url;
                        const duration = resourceType === ResourceType.VIDEO ? result.duration : null;

                        uploadedFiles.push({
                            publicId: result.public_id,
                            size: String(result.bytes),
                            url: url,
                            mimeType: file.mimetype,
                            thumbnail: thumbnail,
                            duration: duration
                        });
                        publicIds.push(result.public_id);
                    } else {
                        failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
                    }
                } catch (error: any) {
                    console.error(`Upload failed for ${file.originalname}:`, error);
                    failedFiles.push({ filename: file.originalname, error: error.message });
                }
            })
        );

        return { uploadedFiles, failedFiles, publicIds };
    }

    public async deleteFiles(publicIds: string[]) {
        try {
            const result = await cloudinary.api.delete_resources(publicIds);
            return this.responseData(200, false, "Files were deleted", result);
        } catch (error) {
            console.error(error);
            return this.responseData(500, true, "Something went wrong");
        }
    }

    public async uploadImage(filePath: string, imageFolder: string) {

        let uploadResult = null;
        let folder = imageFolders(imageFolder);

        try {
            uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
        } catch (error: any) {
            logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
            return super.responseData(500, true, http('500')!);
        }

        const url = this.getUrl(uploadResult.public_id);

        return super.responseData(201, false, null, {
            imageData: uploadResult,
            url
        });
    }

    public async updateImage(filePath: string, publicID: string) {
        try {
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                public_id: publicID,
                overwrite: true // Ensures the image is replaced
            });
            const url = this.getUrl(uploadResult.public_id);

            return super.responseData(201, false, null, {
                imageData: uploadResult,
                url
            });
        } catch (error: any) {
            logger.error(`Error updating file: ${error.message}`, { filePath });
            return super.responseData(500, true, http('500')!);
        }
    }

    private fileOptions(type: string) {
        const resourceMap: Record<string, object> = {
            'image': {},
            'audio': { resource_type: "video" },
            'video': { resource_type: "video" },
        };
        return resourceMap[type] || {};
    }

    public async delete(publicID: string, type: string = "image") {
        const options = this.fileOptions(type);

        try {
            const response = await cloudinary.uploader.destroy(publicID, options);
            if (response.result == "ok") {
                return super.responseData(200, false, "File has been deleted")
            }
            return super.responseData(404, true, "File not found");
        } catch (error: any) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.responseData(500, true, http('500')!);
        }
    }
}
