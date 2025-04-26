import { Response, Request } from "express";
import { logger, redisSub, redisBull, redisClient } from "../config";
import { SSE } from "../services";

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

    private static async subscribeToChannel(baseChannel: string = "user:*", res: Response, messageHandler: (pattern: string, channel: string, message: string) => void) {
        try {
            try {
                // ! Keep an eye on this logic
                await new Promise<void>((resolve, reject) => {
                    SSEController.redisSub.psubscribe(baseChannel, (err) => {
                        if (err) {
                            reject(new Error(`Failed to subscribe to channel - user:*: ${err.message}`));
                        } else {
                            resolve();
                        }
                    });
                });

                if (!SSEController.redisSub.listenerCount('pmessage')) {
                    SSEController.redisSub.on('pmessage', messageHandler);
                }

                // SSEController.redisSub.on('pmessage', messageHandler);
            } catch (error: any) {
                logger.error(`Error subscribing to channel: ${error.message}`);
                throw error;
            }
        } catch (error) {
            res.write(SSE.write("connection", { error: true, message: 'Failed to subscribe to Redis channel' }));
            res.end();
        }
    }

    private static sendHeartbeat(res: Response, interval = 15000) {
        return setInterval(() => {
            res.write(SSE.write("heartbeat")); // Or you can use ':heartbeat\n\n'
        }, interval);
    }

    public static async SSE(req: Request, res: Response) {
        SSEController.setHeaders(res);

        const userId = res.locals.data.id;
        const userType = res.locals.userType;
        const clientChannel = SSE.channel(userType, userId);
        logger.info(`✅ ${userType} - ${userId} has connected`);

        const wasStored = await SSE.storeClient(userType, userId);
        if (!wasStored) res.end();


        const messageHandler = (pattern: string, channel: string, message: string) => {
            if (channel === clientChannel) {
                const { event, ...data } = JSON.parse(message);
                logger.info(`Writing to ${pattern}`)
                res.write(SSE.write(event, data));
            }
        };

        // * Subscribe to user:* channels with psubscribe and pmessage
        await SSEController.subscribeToChannel("user:*", res, messageHandler);

        // * Send welcome message
        res.write(SSE.write("connection", { error: false, message: `User - ${userId} has connected successfully` }));


        // * Start the heartbeat to keep the connection alive
        const heartbeat = SSEController.sendHeartbeat(res);
        const cleanUp = async () => {
            try {
                // ! For psubscribe
                await SSEController.redisSub.punsubscribe(clientChannel);

                const beforeCount = SSEController.redisSub.listenerCount('pmessage');
                SSEController.redisSub.off('pmessage', messageHandler);
                const afterCount = SSEController.redisSub.listenerCount('pmessage');

                if (beforeCount !== afterCount) {
                    logger.info('✅ Successfully removed messageHandler from pmessage');
                } else {
                    logger.warn('⚠️ Failed to remove messageHandler from pmessage — possible handler mismatch');
                }

                await SSEController.redisBull.del(SSE.clientKey(userType, userId));
                clearInterval(heartbeat);
                logger.info(`👋 ${userType} - ${userId} has disconnected`);
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

    private static async addToSet(key: string, member: string): Promise<boolean> {
        const pipeline = redisClient.pipeline();

        pipeline.sadd(key, member);           // Add member
        pipeline.sismember(key, member);      // Check if it was added

        const result = await pipeline.exec();

        if (!result || result.length < 2) return false;

        const [, isMemberResult] = result;

        if (isMemberResult && Array.isArray(isMemberResult) && typeof isMemberResult[1] === 'number') {            
            return isMemberResult[1] === 1;
        }

        return false;
    }


    private static async removeFromSet(key: string, member: string): Promise<boolean> {
        const removed = await redisClient.srem(key, member);
        return removed > 0;
    }

    public static async notification(req: Request, res: Response) {
        SSEController.setHeaders(res);

        const userId = res.locals.data.id;
        const userType = res.locals.userType;
        const clientChannel = SSE.channel(userType, userId, "notification");
        logger.info(`✅ ${userType} - ${userId} has connected`);

        const clientKey = `${userType}s`;
        const wasAdded = await SSEController.addToSet(clientKey, String(userId));
        if (!wasAdded) res.end();

        const messageHandler = (pattern: string, channel: string, message: string) => {
            if (channel === clientChannel) {
                const { event, ...data } = JSON.parse(message);
                logger.info(`Writing to ${pattern}`);
                res.write(SSE.write(event, data));
            }
        };

        // * Subscribe to user:* channels with psubscrremovedibe and pmessage
        await SSEController.subscribeToChannel("notification:*", res, messageHandler);

        // * Send welcome message
        res.write(SSE.write("connection", { error: false, message: `User - ${userId} has connected successfully` }));


        // * Start the heartbeat to keep the connection alive
        const heartbeat = SSEController.sendHeartbeat(res);
        const cleanUp = async () => {
            try {
                // ! For psubscribe
                await SSEController.redisSub.punsubscribe(clientChannel);

                const beforeCount = SSEController.redisSub.listenerCount('pmessage');
                SSEController.redisSub.off('pmessage', messageHandler);
                const afterCount = SSEController.redisSub.listenerCount('pmessage');

                if (beforeCount !== afterCount) {
                    logger.info('✅ Successfully removed messageHandler from pmessage');
                } else {
                    logger.warn('⚠️ Failed to remove messageHandler from pmessage — possible handler mismatch');
                }

                const wasRemoved = await SSEController.removeFromSet(clientKey, String(userId));

                if (wasRemoved) {
                    logger.info('✅ Successfully removed notification user from cache');
                } else {
                    logger.warn('⚠️ Failed to removed notification user from cache ');
                }
                clearInterval(heartbeat);
                logger.info(`👋 ${userType} - ${userId} has disconnected from notification SSE`);
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
} 