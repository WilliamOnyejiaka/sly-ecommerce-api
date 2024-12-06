import ImageRepo from "./ImageRepo";

export default class StoreLogo extends ImageRepo {

    public constructor() {
        super('storeLogo', 'storeId');
    }
}