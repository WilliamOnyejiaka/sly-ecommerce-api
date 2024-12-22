import constants from "../constants";
import Cache from "../interfaces/Cache";
import { redisClient } from "./../config";

export default class OTPCache implements Cache {

    private readonly preKey: string = "otp";
    private readonly expirationTime: number = 900;

    public constructor(partPreKey: string) {
        this.preKey = partPreKey + this.preKey;
    }

    public async set(email: string, otpCode: string) {
        try {
            const success = await redisClient.set(`${this.preKey}-${email}`, otpCode, 'EX', this.expirationTime);
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    public async get(email: string) {
        try {
            const otpCode = await redisClient.get(`${this.preKey}-${email}`);
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