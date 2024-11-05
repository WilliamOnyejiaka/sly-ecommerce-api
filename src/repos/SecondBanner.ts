import { Banner } from ".";
import { ImageRepository } from "../interfaces/Repository";

export default class SecondBanner extends Banner implements ImageRepository {

    public async getImage(storeId: number) {
        return await this.getSecondStoreBanner(storeId);
    }
}