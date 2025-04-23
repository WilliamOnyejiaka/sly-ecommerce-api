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

    private static async subscribeToChannel(res: Response, messageHandler: (pattern: string, channel: string, message: string) => void) {
        try {
            try {
                // ! Keep an eye on this logic
                await new Promise<void>((resolve, reject) => {
                    SSEController.redisSub.psubscribe("user:*", (err) => {
                        if (err) {
                            reject(new Error(`Failed to subscribe to channel - user:*: ${err.message}`));
                        } else {
                            resolve();
                        }
                    });
                });

                SSEController.redisSub.on('pmessage', messageHandler);
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
        await SSEController.subscribeToChannel(res, messageHandler);

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
} 