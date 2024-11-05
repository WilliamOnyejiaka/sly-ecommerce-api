import mime from "mime";
import Service, { Vendor } from ".";
import { http, urls } from "../constants";
import Repository from "../interfaces/Repository";
import { processImage, baseUrl } from "../utils";

class ImageService {

    public async uploadProfilePic<T extends Repository>(image: Express.Multer.File, data: any,repo: T,id: number){
        const result = await processImage(image);

        if (result.error) {
            console.error(result.message);
            return Service.responseData(
                500,
                true,
                http("500")!,
            );
        }

        data['mimeType'] = mime.lookup(image.path);
        const repoResult = await repo.insert(data);

        const imageUrl = baseUrl + urls("baseImageUrl")! + urls("vendorPic")!.split(":")[0] + id;

        return repoResult ?
            Service.responseData(
                201,
                false,
                "Profile picture was created successfully",
                { imageUrl: imageUrl }
            ) :
            Service.responseData(
                500,
                true,
                http("500")!,
            );
    }
}