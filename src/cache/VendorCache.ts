import constants from "../constants";
import Cache from "../interfaces/Cache";
import VendorDto from "../types/dtos";
import { redisClient } from "./../config";

export default class VendorCache implements Cache {

    private readonly preKey: string = "vendor";
    private readonly expirationTime: number = 2_592_000;

    public async set(email: string, vendorDto: VendorDto) {
        try {
            const success = await redisClient.set(
                `${this.preKey}-${email}`,
                JSON.stringify(vendorDto),
                'EX',
                this.expirationTime
            );
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    public async get(email: string) {
        try {
            const vendor = await redisClient.get(`${this.preKey}-${email}`);
            return {
                error: false,
                data: vendor ?? JSON.parse(vendor!),
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                data: null
            };
        }
    }

    public async delete(email: string) {
        try {
            const result = await redisClient.del(`${this.preKey}-${email}`);
            return result === 1 ? true : false;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return false;
        }
    }
}