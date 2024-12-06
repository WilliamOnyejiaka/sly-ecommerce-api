import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./ImageRepo";

export default class FirstBanner extends ImageRepo {

    public constructor() {
        super('firstStoreBanner', 'storeId');
    }

    // public async getImage(storeId: number){
    //     return await this.getFirstStoreBanner(storeId);
    // }
}