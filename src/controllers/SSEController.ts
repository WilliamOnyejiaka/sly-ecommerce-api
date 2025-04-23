import { Response, Request } from "express";
import { logger, redisSub, redisBull } from "../config";
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

        // Clean up on disconnect
        req.on('close', async () => {
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
        });
    }
} 