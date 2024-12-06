import ImageRepo from "./ImageRepo";

export default class CategoryImage extends ImageRepo {

    public constructor() {
        super('categoryImage', 'categoryId');
    }
}
