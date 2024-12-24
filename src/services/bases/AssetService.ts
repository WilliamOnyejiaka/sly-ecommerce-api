import { env } from "../../config";
import constants, { http, HttpStatus } from "../../constants";
import AssetRepo from "../../repos/bases/AssetRepo";
import ImageRepo from "../../repos/bases/ImageRepo";
import ImageService from "../Image";
import BaseService from "./BaseService";

export default class AssetService<T extends AssetRepo, U extends ImageRepo> extends BaseService<T> {

    protected readonly imageService: ImageService = new ImageService();

    public constructor(repo: T, protected readonly imageRepo: U, protected readonly imageFolderName: string) {
        super(repo);
    }

    public async uploadImage(image: Express.Multer.File, parentId: number) {
        const repoResult = await this.repo!.getItemAndImageRelationWithId(parentId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) {
            if (!(await this.imageService.deleteFiles([image]))) return repoResultError;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const item = repoResult.data;
        const hasImage = item[this.repo!.imageRelation].length > 0;
        if (hasImage) {
            if (!(await this.imageService.deleteFiles([image]))) return super.responseData(400, true, "This item already has an image");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const serviceResult = await this.imageService.uploadImage<U>(
            image,
            parentId,
            this.imageRepo,
            this.imageFolderName
        );
        return serviceResult;
    }

    public async deleteItem(itemId: number) {
        const itemDetailsRepoResult = await this.repo!.getItemAndImageRelationWithId(itemId);
        const itemDetailsRepoResultError = super.handleRepoError(itemDetailsRepoResult);
        if (itemDetailsRepoResultError) return itemDetailsRepoResultError;

        const itemDetails = itemDetailsRepoResult.data;
        if (!itemDetails) return super.responseData(404, true, "Item was not found");

        const imageDetails = itemDetails[this.repo!.imageRelation].length > 0 ? itemDetails[this.repo!.imageRelation][0] : null;

        if (imageDetails) {
            const cloudinaryResult = await this.imageService.deleteCloudinaryImage(imageDetails.publicId);
            if (cloudinaryResult.statusCode >= 500) {
                return cloudinaryResult;
            }
        }

        const repoResult = await this.repo!.deleteWithId(itemId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, "Item was deleted successfully");
    }
}