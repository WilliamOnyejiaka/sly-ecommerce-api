import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, CompletedJob } from "../../../types";
import { Queues, SSEEvents, UserType } from "../../../types/enums";
import { logger, redisBull, redisClient } from "../../../config";
import { newFollowerQueue } from "../../queues";
import { Customer, Product, NewFollower as NewFollowerRepo } from "../../../repos";
import { SSE } from "../../../services";
import cluster from "cluster";


interface IJob {
    customerId: number,
    storeId: number,
    vendorId: number
}

export default class NewFollower implements IWorker<IJob> {

    public config: WorkerConfig;
    public queueName = Queues.NEW_FOLLOWER;
    public eventName: string = SSEEvents.NEW_FOLLOWER;
    public queue: Queue = newFollowerQueue;

    public constructor(config?: WorkerConfig) {
        this.config = { connection: redisBull, concurrency: 10, ...config };
    }

    public async process(job: Job<IJob>) {
        const { id: jobId, data } = job;
        const { vendorId, customerId, storeId } = job.data;

        const newFollowerRepo = new NewFollowerRepo();
        const newFollowerResult = await newFollowerRepo.insert({ customerId, storeId });
        console.log("New Follower", newFollowerResult.error, " ", newFollowerResult.message);


        if (!newFollowerResult.error) {
            const customerRepo = new Customer();
            const repoResult = await customerRepo.getUserProfileWithId(customerId);
            if (repoResult.error) return { error: true, followerProfile: null, vendorId }

            const customerProfile = repoResult.data;
            const profilePicture = customerProfile.CustomerProfilePic.length > 0 ? customerProfile.CustomerProfilePic[0].imageUrl : null;

            const followerProfile = {
                id: customerProfile.id,
                firstName: customerProfile.firstName,
                lastName: customerProfile.lastName,
                profilePicture

            }
            console.log("New Follower Notification has been saved successfully");

            return { error: false, followerProfile, vendorId };
        }
        console.log("New Follower Notification failed to save");
        return { error: true, followerProfile: null, vendorId };
    }

    // public async completed({ jobId, returnvalue }: CompletedJob) {
    //     const key = UserType.Vendor + "s"
    //     const vendorId = returnvalue.vendorId;
    //     const error = returnvalue.error;
    //     try {
    //         let result = await redisClient.sismember(key, String(vendorId));
    //         console.log("Checking if vendor is a member");

    //         if (!error && result == 1) {
    //             console.log("vendor has passed the check");
    //             const data = {
    //                 error: error,
    //                 followerProfile: returnvalue.followerProfile
    //             }
    //             if (cluster.isPrimary) {
    //                 await SSE.publishSSEEvent(UserType.Vendor, vendorId, { event: this.eventName, data, error: false }, "notification");
    //                 logger.info(`👍 Vendor - ${vendorId} has been notified of the follow`);
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // public async completed({ jobId, returnvalue }: CompletedJob) {
    //     const key = UserType.Vendor + "s";
    //     const vendorId = returnvalue.vendorId;
    //     const error = returnvalue.error;

    //     console.log("Checking if vendor is a member");

    //     // Early exit if returnvalue has error
    //     if (error) {
    //         console.log("Job completed with a db error ");
    //         return;
    //     }

    //     // Early exit if vendorId is not defined
    //     if (!vendorId) {
    //         console.log("Missing vendorId in returnvalue");
    //         return;
    //     }

    //     let isMember: number;
    //     try {
    //         isMember = await redisClient.sismember(key, String(vendorId));
    //     } catch (err) {
    //         console.error("Redis error while checking vendor membership:", err);
    //         return;
    //     }

    //     // Early exit if vendor is not in the Redis set
    //     if (isMember !== 1) {
    //         console.log(`Vendor ${vendorId} is not a member of ${key}`);
    //         return;
    //     }

    //     // Early exit if not running on the primary cluster process
    //     if (!cluster.isPrimary) {
    //         return;
    //     }

    //     const data = {
    //         error: false,
    //         followerProfile: returnvalue.followerProfile
    //     };

    //     try {
    //         await SSE.publishSSEEvent(UserType.Vendor, vendorId, { event: this.eventName, data, error: false }, "notification");
    //         logger.info(`👍 Vendor - ${vendorId} has been notified of the follow`);
    //     } catch (err) {
    //         console.error("Failed to publish SSE event:", err);
    //     }
    // }


    public async completed({ jobId, returnvalue }: CompletedJob) {
        const key = UserType.Vendor + "s";
        const vendorId = returnvalue.vendorId;
        const error = returnvalue.error;

        console.log("Checking if vendor is a member");

        // Early exit if returnvalue has error
        if (error) {
            console.log("Job completed with a db error ");
            return;
        }

        // Early exit if vendorId is not defined
        if (!vendorId) {
            console.log("Missing vendorId in returnvalue");
            return;
        }

        let isMember: number;
        try {
            isMember = await redisClient.sismember(key, String(vendorId));
        } catch (err) {
            console.error("Redis error while checking vendor membership:", err);
            return;
        }

        // Early exit if vendor is not in the Redis set
        if (isMember !== 1) {
            console.log(`Vendor ${vendorId} is not a member of ${key}`);
            return;
        }

        // Early exit if not running on the primary cluster process
        if (!cluster.isPrimary) {
            return;
        }

        // Set a distributed lock to prevent multiple processes from publishing the event
        const lockKey = `vendor_notify_lock:${vendorId}`;
        const lockValue = Date.now().toString();

        try {
            // Attempt to acquire the lock using setnx (returns 1 if key was set)
            const lockAcquired = await redisClient.setnx(lockKey, lockValue);

            if (lockAcquired !== 1) {
                console.log(`Another process is already publishing for vendor ${vendorId}`);
                return; // Exit if lock is not acquired
            }

            const data = {
                error: false,
                followerProfile: returnvalue.followerProfile
            };

            // Publish the event if lock was acquired
            await SSE.publishSSEEvent(UserType.Vendor, vendorId, { event: this.eventName, data, error: false }, "notification");
            logger.info(`👍 Vendor - ${vendorId} has been notified of the follow`);
        } catch (err) {
            console.error("Failed to acquire lock or publish event:", err);
        } finally {
            // Optionally, you can release the lock after a timeout or immediately after publishing the event
            await redisClient.del(lockKey);
        }
    }

}