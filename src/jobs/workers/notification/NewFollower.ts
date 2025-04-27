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
        const { vendorId, customerId, storeId } = job.data;

        const newFollowerRepo = new NewFollowerRepo();
        const newFollowerResult = await newFollowerRepo.insert({ customerId, storeId });


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

    public async completed({ jobId, returnvalue }: CompletedJob) {
        const key = UserType.Vendor + "s";
        const vendorId = returnvalue.vendorId;
        const error = returnvalue.error;

        let isMember: number;
        try {
            isMember = await redisClient.sismember(key, String(vendorId));
        } catch (err) {
            console.error("Redis error while checking vendor membership:", err);
            return;
        }

        if (isMember !== 1) {
            console.log(`Vendor ${vendorId} is not a member of ${key}`);
            return;
        }
        try {
                const data = {
                    error: false,
                    followerProfile: returnvalue.followerProfile
                };
                await SSE.publishSSEEvent(UserType.Vendor, vendorId, { event: this.eventName, data, error: false }, "notification");
                logger.info(`👍 Vendor - ${vendorId} has been notified of the follow`);
        } catch (err) {
            console.error("Failed to acquire lock or publish event:", err);
        }
    }

}