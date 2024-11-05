import OTPCache from "./OTPCache";
import VendorCache from "./VendorCache";

import constants from "../constants";
import Cache from "../interfaces/Cache";
import { redisClient } from "./../config";

export default class BaseCache implements Cache {

    private readonly preKey: string;
    private readonly expirationTime: number;

    constructor(preKey: string, expirationTime: number){
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }

    public async set(postKey: string, data: string) {
        try {
            const success = await redisClient.set(`${this.preKey}-${postKey}`, data, 'EX', this.expirationTime);
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    public async get(postKey: string) {
        try {
            const otpCode = await redisClient.get(`${this.preKey}-${postKey}`);
            return {
                error: false,
                otpCode: otpCode
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                otpCode: null
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

export { OTPCache, VendorCache };