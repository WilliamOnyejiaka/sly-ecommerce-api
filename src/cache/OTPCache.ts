import constants from "../constants";
import {redisClient} from "./../config";

export default class OTPCache {

    private static readonly preKey: string = "otp";
    private static readonly expirationTime: number = 900;

    public static async set(email: string,otpCode: string){
        try{
            const success = await redisClient.set(`${this.preKey}-${email}`,otpCode,'EX',OTPCache.expirationTime);
            return success === "OK";
        }catch(error){
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    public static async get(email: string){
        try{
            const otpCode = await redisClient.get(`${this.preKey}-${email}`);
            return {
                error: false,
                otpCode: otpCode
            }
        }catch(error){
            console.error("Failed to get cached item: ",error);
            return {
                error: true,
                otpCode: null
            };
        }
    }

    public static async delete(email: string){
        try {
            const result = await redisClient.del(`${this.preKey}-${email}`);
            return result === 1 ? true : false;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return false;
        }
    }
}