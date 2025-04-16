
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ImageUploadType } from "../types/enums";

const allowedMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
const bannerFields: string[] = ['firstBanner', 'secondBanner'];
const storeImagesFields: string[] = ['firstBanner', 'secondBanner', 'storeLogo', 'name', 'address'];
const fileSize: number = 3.0 * 1024 * 1024;

const storage = multer.memoryStorage(); // Using memory storage

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']; // ! TODO: use the global one
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    return cb(null, true);
}

export const imageUploads = (type: ImageUploadType) => {
    let imageFilter = imageFileFilter;
    if (type == "banner") imageFilter = bannerFilter;
    if (type == "storeImages") imageFilter = storeImagesFilter;

    return multer({
        storage: storage,
        limits: {
            fileSize: 3.0 * 1024 * 1024 // ! TODO: use the global one
        },
        fileFilter: imageFilter
    });
}

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 3.0 * 1024 * 1024 // ! TODO: use the global one
    },
    fileFilter: imageFileFilter
});

const bannerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!bannerFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_BANNER_FIELD_NAME"));
    }
    return cb(null, true);
}

export const bannerUploads = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: bannerFilter
});

const storeImagesFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!storeImagesFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_FIELD_NAME"));
    }
    return cb(null, true);
}

export const storeImagesUploads = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: storeImagesFilter
});



export default uploads;
