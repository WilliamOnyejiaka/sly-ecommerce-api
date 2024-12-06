import { redisClient } from "../config";
import constants from "../constants";

export default class BaseCache {

    protected readonly preKey: string;
    protected readonly expirationTime: number;


    public constructor(preKey: string, expirationTime: number = 2_592_000) {
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }

    public async set(key: string, data: any, expirationTime?: number) {
        try {
            const success = await redisClient.set(
                `${this.preKey}-${key}`,
                JSON.stringify(data),
                'EX',
                expirationTime ?? this.expirationTime
            );
            return success === "OK";
        } catch (error) {
            console.error(`${constants("failedCache")}: ${error}`);
            return false;
        }
    }

    public async get(key: string) {
        try {
            const item = await redisClient.get(`${this.preKey}-${key}`);
            return {
                error: false,
                data: item ?? JSON.parse(item!),
            }
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return {
                error: true,
                data: null
            };
        }
    }
}