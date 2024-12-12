import BaseCache from "./BaseCache";

export default class VendorCache extends BaseCache {

    public constructor() {
        super('vendor', 2_592_000);
    }

    // private readonly preKey: string = "vendor";
    // private readonly expirationTime: number = 2_592_000;

    // public async set(vendorId: string, vendorDto: VendorDto) {
    //     try {
    //         const success = await redisClient.set(
    //             `${this.preKey}-${vendorId}`,
    //             JSON.stringify(vendorDto),
    //             'EX',
    //             this.expirationTime
    //         );
    //         return success === "OK";
    //     } catch (error) {
    //         console.error(`${constants("failedCache")}: ${error}`);
    //         return false;
    //     }
    // }

    // public async get(vendorId: string) {
    //     try {
    //         const vendor = await redisClient.get(`${this.preKey}-${vendorId}`);
    //         return {
    //             error: false,
    //             data: vendor ?? JSON.parse(vendor!),
    //         }
    //     } catch (error) {
    //         console.error("Failed to get cached item: ", error);
    //         return {
    //             error: true,
    //             data: null
    //         };
    //     }
    // }
}