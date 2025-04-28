import Rating from "./bases/Rating";

export default class ProductRating extends Rating {

    public constructor(){
        super('productRating',"productId");
    }
}