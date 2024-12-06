import ImageRepo from "./ImageRepo";

export default class AdminProfilePicture extends ImageRepo {

    public constructor() {
        super('adminProfilePicture', 'adminId');
    }
}