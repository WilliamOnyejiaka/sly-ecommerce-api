import Like from "./bases/Like";

export default class ProductLike extends Like {

    public constructor() {
        super('productLike', 'productId');
    }
}