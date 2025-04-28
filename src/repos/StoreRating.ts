import Rating from "./bases/Rating";

export default class StoreRating extends Rating {

    public constructor() {
        super('storeRating', "storeId");
    }
}