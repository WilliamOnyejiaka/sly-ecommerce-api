import Redis from 'ioredis';
import { env } from '.';
import RedisStore from 'rate-limit-redis';
import Redlock from 'redlock';

const redisClient = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: 10,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

const retryStrategy = (times: any) => {
    const delay = Math.min(times * 100, 2000); // wait time between reconnects
    console.log(`Reconnecting to Redis pub in ${delay}ms...`);
    return delay;
};

export const redisBull = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

export const redisPub = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: 10,
    retryStrategy: retryStrategy
});

export const redisSub = new Redis(env('redisURL')!, {
    maxRetriesPerRequest: 10,
    retryStrategy: retryStrategy
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

export const redlock = new Redlock(
    // You should have one client for each independent redis node
    // or cluster.
    [redisClient],
    {
        // The expected clock drift; for more details see:
        // http://redis.io/topics/distlock
        driftFactor: 0.01, // multiplied by lock ttl to determine drift time

        // The max number of times Redlock will attempt to lock a resource
        // before erroring.
        retryCount: 10,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200, // time in ms

        // The minimum remaining time on a lock before an extension is automatically
        // attempted with the `using` API.
        automaticExtensionThreshold: 500, // time in ms
    }
);

export const store = new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
});

export default redisClient;
