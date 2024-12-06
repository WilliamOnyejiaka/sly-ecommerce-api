import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./ImageRepo";

export default class SecondBanner extends ImageRepo {

    public constructor() {
        super('secondStoreBanner', 'storeId');
    }

    // public async getImage(storeId: number) {
    //     return await this.getSecondStoreBanner(storeId);
    // }
}