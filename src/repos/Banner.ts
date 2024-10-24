import prisma from ".";

export default class Banner {

    static async insertFirstStoreBanner(pictureData: any) { // TODO: create a separate type for this
        try {
            const newBanner = await prisma.firstStoreBanner.upsert({
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
            return newBanner;
        } catch (error) {
            console.error("Failed to create first store banner: ", error);
            return {};
        }
    }

    static async insertSecondStoreBanner(pictureData: any) { // TODO: create a separate type for this
        try {
            const newBanner = await prisma.secondStoreBanner.upsert({
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
            return newBanner;
        } catch (error) {
            console.error("Failed to create second store banner: ", error);
            return {};
        }
    }

    static async getFirstStoreBanner(storeId: number) {
        try {
            const banner = await prisma.firstStoreBanner.findUnique({
                where: {
                    storeId
                }
            });
            return {
                error: false,
                data: banner
            };
        } catch (error) {
            console.error("Failed to find first store banner: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

    static async getSecondStoreBanner(storeId: number) {
        try {
            const banner = await prisma.secondStoreBanner.findUnique({
                where: {
                    storeId
                }
            });
            return {
                error: false,
                data: banner
            };
        } catch (error) {
            console.error("Failed to find second store banner: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

}