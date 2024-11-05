import { Banner } from ".";
import { ImageRepository } from "../interfaces/Repository";

export default class FirstBanner extends Banner implements ImageRepository {

    public async getImage(storeId: number){
        return await this.getFirstStoreBanner(storeId);
    }
}