import { Response, Request } from "express";
import { logger, redisSub, redisBull, redisClient } from "../config";
import { SSE } from "../services";
import { v4 as uuid } from 'uuid';

export default class SSEController {

    protected static readonly redisSub = redisSub;
    protected static readonly redisBull = redisBull;

    private static setHeaders(res: Response) {
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

    }

    private static async subscribeToChannel(channel: string, messageHandler: (channel: string, message: string) => void) {
        try {
            await new Promise<void>((resolve, reject) => {
                SSEController.redisSub.subscribe(channel, (err) => {
                    if (err) {
                        reject(new Error(`Failed to subscribe to channel ${channel}: ${err.message}`));
                    } else {
                        resolve();
                    }
                });
            });
            SSEController.redisSub.on('message', messageHandler);
        } catch (error: any) {
            logger.error(`Error subscribing to channel: ${error.message}`);
            throw error;
        }
    }

    private static sendHeartbeat(res: Response, interval = 15000) {
        return setInterval(() => {
            res.write(':heartbeat\n\n');
        }, interval);
    }

    public static async SSE(req: Request, res: Response) {
        SSEController.setHeaders(res);

        const clientId = res.locals.data.id;
        const userType = res.locals.userType;
        const clientChannel = SSE.channel(userType, clientId);
        logger.info(`✅ ${userType} - ${clientId} has connected`);

        const wasStored = await SSE.storeClient(userType, clientId);
        if (!wasStored) res.end();

        const messageHandler = (channel: string, message: string) => {
            if (channel === clientChannel) {
                const { event, ...data } = JSON.parse(message);
                res.write(SSE.write(event, data));
            }
        };

        try {
            await SSEController.subscribeToChannel(clientChannel, messageHandler);
        } catch (error) {
            res.status(500).send();
            res.write(SSE.write("connection", { error: true, message: 'Failed to subscribe to Redis channel' }));
            res.end();
        }


        // Send welcome message
        res.write(SSE.write("connection", { error: false, message: `User - ${clientId} has connected successfully` }));

        // Start the heartbeat to keep the connection alive
        const heartbeat = SSEController.sendHeartbeat(res);
        const cleanUp = async () => {
            try {
                await SSEController.redisSub.unsubscribe(clientChannel);
                await SSEController.redisBull.del(SSE.clientKey(userType, clientId));
                clearInterval(heartbeat);
                SSEController.redisSub.off('message', messageHandler); // Cleanup the message handler
                logger.info(`👋 ${userType} - ${clientId} has disconnected`);
                res.end();
            } catch (err: any) {
                logger.error(`Error during cleanup: ${err.message}`);
            }
        };

        // Clean up on disconnect
        req.on('close', cleanUp);
        res.on('finish', cleanUp);
        res.on('error', cleanUp);
    }

    // public static async SSE(req: Request, res: Response) {
    //     SSEController.setHeaders(res);

    //     const clientId = res.locals.data.id;
    //     const userType = res.locals.userType;
    //     const clientChannel = SSE.channel(userType, clientId);
    //     const streamKey = `user:${userType}:${clientId}:events`;
    //     const group = `user:${userType}:${clientId}:group`;
    //     const consumer = uuid(); // unique per connection
    //     logger.info(`✅ ${userType} - ${clientId} has connected`);

    //     // Try to create the group (ignore if it exists)
    //     try {
    //         await redisClient.xgroup('CREATE', streamKey, group, '$', 'MKSTREAM');
    //     } catch (err: any) {
    //         if (!err.message.includes('BUSYGROUP')) throw err;
    //     }

    //     let running = true;

    //     const poll = async () => {
    //         while (running) {
    //             try {
    //                 const messages = await redisClient.xreadgroup(
    //                     'GROUP', group, consumer,
    //                     'COUNT', 10,
    //                     'BLOCK', 10000,
    //                     'STREAMS', streamKey, '>'
    //                 ) as [string, [string, string[]][]][];

    //                 if (messages) {
    //                     for (const [, entries] of messages) {
    //                         for (const [id, [, data]] of entries) {
    //                             res.write(`data: ${data}\n\n`);
    //                             await redisClient.xack(streamKey, group, id);
    //                         }
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.error('Redis stream error:', err);
    //                 break;
    //             }
    //         }
    //     };

    //     poll();

    //     req.on('close', async () => {
    //         running = false;
    //         res.end();
    //         await redisClient.xgroup('DELCONSUMER', streamKey, group, consumer);
    //     });
    // }

    // public static async SSE(req: Request, res: Response) {
    //     SSEController.setHeaders(res);

    //     const clientId = res.locals.data.id;
    //     const userType = res.locals.userType;
    //     const streamKey = `user:${clientId}:events`;
    //     const group = `user:${clientId}:group`;
    //     const consumer = uuid();

    //     logger.info(`✅ ${userType} - ${clientId} connected`);

    //     // Create consumer group if not exists
    //     try {
    //         await redisClient.xgroup('CREATE', streamKey, group, '$', 'MKSTREAM');
    //     } catch (err: any) {
    //         if (!err.message.includes('BUSYGROUP')) throw err;
    //     }

    //     let running = true;

    //     // Fast delivery via Pub/Sub
    //     // const sub = redisClient.duplicate();
    //     // await sub.connect();
    //     // await redisSub.subscribe(`user:${clientId}:pubsub`, (message) => {
    //     //     console.log('🔔 Pub/Sub message received:', message);
    //     //     if (running) res.write(`data: ${message}\n\n`);
    //     // });

    //     const messageHandler = (channel: string, message: string) => {
    //         if (channel === `user:${clientId}:pubsub`) {
    //             const { event, ...data } = JSON.parse(message);
    //             res.write(SSE.write(event, data));
    //         }
    //     };


    //     await SSEController.subscribeToChannel(`user:${clientId}:pubsub`, messageHandler);


    //     // Fallback/reliable delivery via stream
    //     const poll = async () => {
    //         while (running) {
    //             try {
    //                 const messages = await redisClient.xreadgroup(
    //                     'GROUP', group, consumer,
    //                     'COUNT', 10,
    //                     'BLOCK', 10000,
    //                     'STREAMS', streamKey, '>'
    //                 ) as [string, [string, string[]][]][];

    //                 for (const [, entries] of messages ?? []) {
    //                     for (const [id, [, raw]] of entries) {
    //                         console.log(raw);

    //                         const { event, data } = JSON.parse(raw);

    //                         res.write(SSE.write(event, data));
    //                         await redisClient.xack(streamKey, group, id);
    //                     }
    //                 }
    //             } catch (err) {
    //                 logger.error('Redis stream error:', err);
    //                 await new Promise(res => setTimeout(res, 1000));
    //             }
    //         }
    //     };

    //     poll();

    //     // Optional: keep connection alive
    //     const keepAlive = setInterval(() => {
    //         res.write(`: ping\n\n`);
    //     }, 15000);

    //     req.on('close', async () => {
    //         running = false;
    //         clearInterval(keepAlive);
    //         res.end();
    //         await redisSub.unsubscribe(`user:${clientId}:pubsub`);
    //         await redisSub.quit();
    //         await redisClient.xgroup('DELCONSUMER', streamKey, group, consumer);
    //         logger.info(`❌ ${userType} - ${clientId} disconnected`);
    //     });
    // }

    // public static async SSE(req: Request, res: Response) {
    //     SSEController.setHeaders(res);

    //     const clientId = res.locals.data.id;
    //     const userType = res.locals.userType;
    //     const streamKey = `user:${clientId}:events`;
    //     const group = `user:${clientId}:group`;
    //     const consumer = uuid();
    //     const eventTTL = 3600; // Time-to-live for event IDs in Redis (1 hour)
    //     let running = true;

    //     logger.info(`✅ ${userType} - ${clientId} connected`);

    //     // Create stream group if not exists
    //     try {
    //         await redisClient.xgroup('CREATE', streamKey, group, '$', 'MKSTREAM');
    //     } catch (err: any) {
    //         if (!err.message.includes('BUSYGROUP')) throw err;
    //     }

    //     // Pub/Sub Fast Delivery
    //     const messageHandler = async (channel: string, message: string) => {
    //         if (channel === `user:${clientId}:pubsub`) {
    //             try {
    //                 const parsed = JSON.parse(message);
    //                 const eventId = parsed.id;

    //                 // Check if the event has already been processed
    //                 const alreadyProcessed = await redisClient.sismember(`user:${clientId}:processed`, eventId);
    //                 if (!alreadyProcessed) {
    //                     res.write(SSE.write(parsed.event, parsed));
    //                     const pipeline = redisClient.pipeline();
    //                     pipeline.sadd(`user:${clientId}:processed`, eventId); // Mark the event as processed
    //                     pipeline.expire(`user:${clientId}:processed`, eventTTL); // Set TTL for cleanup
    //                     pipeline.exec();
    //                 }
    //             } catch (e) {
    //                 logger.error('Failed to parse pubsub message', e);
    //             }
    //         }
    //     };

    //     await SSEController.subscribeToChannel(`user:${clientId}:pubsub`, messageHandler);

    //     // Stream Reliable Fallback
    //     const poll = async () => {
    //         while (running) {
    //             try {
    //                 const messages = await redisClient.xreadgroup(
    //                     'GROUP', group, consumer,
    //                     'COUNT', 10,
    //                     'BLOCK', 10000,
    //                     'STREAMS', streamKey, '>'
    //                 ) as [string, [string, string[]][]][];

    //                 for (const [, entries] of messages ?? []) {
    //                     for (const [id, [, raw]] of entries) {
    //                         try {
    //                             const parsed = JSON.parse(raw);
    //                             const eventId = parsed.id;

    //                             // Check if the event has already been processed
    //                             const alreadyProcessed = await redisClient.sismember(`user:${clientId}:processed`, eventId);
    //                             if (!alreadyProcessed) {
    //                                 console.log("From stream");

    //                                 await redisClient.sadd(`user:${clientId}:processed`, eventId); // Mark the event as processed
    //                                 await redisClient.expire(`user:${clientId}:processed`, eventTTL); // Set TTL for cleanup
    //                                 res.write(SSE.write(parsed.event, parsed));
    //                             }

    //                             await redisClient.xack(streamKey, group, id);
    //                         } catch (e) {
    //                             logger.error('Failed to process stream message', e);
    //                         }
    //                     }
    //                 }
    //             } catch (err) {
    //                 logger.error('Redis stream error:', err);
    //                 await new Promise(res => setTimeout(res, 1000));
    //             }
    //         }
    //     };

    //     poll();

    //     // Ping to keep connection alive
    //     const keepAlive = setInterval(() => {
    //         res.write(`: ping\n\n`);
    //     }, 15000);

    //     // Clean up
    //     req.on('close', async () => {
    //         running = false;
    //         clearInterval(keepAlive);
    //         res.end();
    //         await redisSub.unsubscribe(`user:${clientId}:pubsub`);
    //         await redisSub.quit();
    //         await redisClient.xgroup('DELCONSUMER', streamKey, group, consumer);
    //         logger.info(`❌ ${userType} - ${clientId} disconnected`);
    //     });
    // }
} 