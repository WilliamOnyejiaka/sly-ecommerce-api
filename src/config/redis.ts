import Redis from 'ioredis';
import { env } from '.';
import RedisStore from 'rate-limit-redis';

// const redisClient = new Redis(env('redisURL')!);
const redisClient = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: 10,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});


export const redisBull = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

export const redisPub = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

export const redisSub = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

const redisClients: { type: string, client: Redis }[] = [
    { type: "cache", client: redisClient },
    { type: "publisher", client: redisPub },
    { type: "subscriber", client: redisSub },
    { type: "bull", client: redisBull }
];

redisClients.forEach(({ client, type }) => {
    client.on('connecting', () => console.log(`Redis ${type} Connecting...`))
    client.on("connect", () => {
        console.log(`Redis ${type} running on port - ${client.options.port}`);
    });
    client.on('error', (err) => console.error(`Redis ${type}  error:`, err));
    client.on('reconnecting', () => console.log(`Redis ${type}  reconnecting...`));
});



// redisClient.on("connecting", () => {
//     console.log("Redis Connecting...");
// });

// redisClient.on("connect", () => {
//     console.log('redis running on port - ', redisClient.options.port);
// });

// redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
// });

export const store = new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
});

export default redisClient;
