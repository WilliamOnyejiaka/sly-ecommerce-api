import prisma from ".";
import AssetRepo from "./bases/AssetRepo";

export default class AdBanner extends AssetRepo {

    public constructor() {
        super('adBanner', 'AdBannerImage');
    }

    public async insertWithRelations(bannerDetails: any, adImage?: any) {
        try {
            const data: any = {
                ...bannerDetails as any
            };
            adImage && (data[this.imageRelation] = { create: adImage });

            const newAdBanner = await prisma.adBanner.create({
                data: data
            });

            return super.repoResponse(false, 201, null, newAdBanner);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getItemWithTitle(title: string) {
        return await super.getItem({ title: title });
    }
}