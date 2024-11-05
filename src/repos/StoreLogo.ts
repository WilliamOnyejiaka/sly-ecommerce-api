import prisma from ".";
import { ImageRepository } from "../interfaces/Repository";

export default class StoreLogo implements ImageRepository {

    public async insert(pictureData: any) { // TODO: create a separate type for this
        try {
            const newStoreLogo = await prisma.storeLogo.upsert({
                where: { storeId: pictureData.storeId },
                update: {
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
                create: {
                    storeId: pictureData.storeId,
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
            });
            return newStoreLogo;
        } catch (error) {
            console.error("Failed to create store logo: ", error);
            return {};
        }
    }

    public async getImage(storeId: number) {
        try {
            const storeLogo = await prisma.storeLogo.findUnique({
                where: {
                    storeId
                }
            });
            return {
                error: false,
                data: storeLogo
            };
        } catch (error) {
            console.error("Failed to find store logo with store id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

}