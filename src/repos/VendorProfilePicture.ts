import prisma from ".";

export default class VendorProfilePicture {

    public async insert(pictureData: any) { // TODO: create a separate type for this
        try {
            const newVendorProfilePicture = await prisma.vendorProfilePicture.upsert({
                where: { vendorId: pictureData.vendorId },
                update: {
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
                create: {
                    vendorId: pictureData.vendorId,
                    mimeType: pictureData.mimeType,
                    picture: pictureData.picture,
                },
            });
            return newVendorProfilePicture;
        } catch (error) {
            console.error("Failed to create vendor profile picture: ", error);
            return {};
        }
    }

    public async getProfilePicture(vendorId: number) {
        try {
            const profilePicture = await prisma.vendorProfilePicture.findUnique({
                where: {
                    vendorId
                }
            });
            return {
                error: false,
                data: profilePicture
            };
        } catch (error) {
            console.error("Failed to find profile picture with vendor id: ", error);
            return {
                error: true,
                data: {}
            };
        }
    }

}