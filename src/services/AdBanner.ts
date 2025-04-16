import constants, { http, HttpStatus } from "../constants";
import { AdBanner as AdBannerRepo, AdBannerImage } from "../repos";
import { CdnFolders } from "../types/enums";
import AssetService from "./bases/AssetService";

export default class AdBanner extends AssetService<AdBannerRepo, AdBannerImage> {

    public constructor() {
        super(new AdBannerRepo(), new AdBannerImage(), CdnFolders.AD_BANNER);
    }

    public async createAdBannerAll(bannerDetails: any, image: Express.Multer.File) {
        const adBannerTitleResult = await this.repo!.getItemWithTitle(bannerDetails.title);
        const adBannerTitleResultError = this.handleRepoError(adBannerTitleResult);

        if (adBannerTitleResultError) return adBannerTitleResultError;

        if (adBannerTitleResult.data) return super.responseData(HttpStatus.BAD_REQUEST, true, "Title already exists");

        const uploadFolder: Record<string, CdnFolders> = { adBanner: this.imageFolderName };
        const uploadResults = await this.imageService.uploadImages([image], uploadFolder);
        const bannerImage = uploadResults.data;

        if (bannerImage) {

            const repoResult = await this.repo!.insertWithRelations(
                bannerDetails,
                bannerImage?.adBanner
            );

            if (!repoResult.error) {
                const result = {
                    ...repoResult.data,
                    adBannerUrl: bannerImage.adBanner?.imageUrl ?? null,
                };

                return super.responseData(
                    201,
                    false,
                    "AdBanner was created successfully",
                    result
                );
            }

            return super.responseData(repoResult.type, true, repoResult.message!);
        }
        return super.responseData(500, true, "Error processing image");
    }

    public async getAdBannerWithId(id: number) {
        const serviceResult = await super.getItemAndImage(id);
        return serviceResult;
    }

    public async getAllCategories(admin: boolean = false) {
        const message = constants('200Categories')!;
        return admin ? super.getAllAssetItems(message) : super.getAllAssetItems(message, ['adminId']);
    }

    public async updateAll(id: number, updateData: any) {
        const repoResult = await this.repo!.updateItem(id, updateData);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "AdBanner has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async updateTitle(id: number, title: string) {
        const repoResult = await this.repo!.updateItem(id, { title: title });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "AdBanner title has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async updateDescription(id: number, description: string) {
        const repoResult = await this.repo!.updateItem(id, { description: description });
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        const message = "AdBanner description has been updated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }
}