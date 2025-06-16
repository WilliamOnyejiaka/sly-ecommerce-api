import { Job, Queue } from "bullmq";
import { WorkerConfig, IWorker, CompletedJob } from "../../../types";
import { NotificationType, Queues, SSEEvents, StreamEvents, StreamGroups, UserType } from "../../../types/enums";
import { logger, redisBull, redisClient, streamRouter } from "../../../config";
import { newFollowerQueue } from "../../queues";
import { Customer } from "../../../repos";
import { WorkerUtil } from "../../../utils";

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
        const { vendorId, customerId } = job.data;

        const customerRepo = new Customer();
        const repoResult = await customerRepo.getUserProfileWithId(customerId);
        const repoResultError = WorkerUtil.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const customerProfile = repoResult.data;
        const profilePicture = customerProfile.CustomerProfilePic.length > 0 ? customerProfile.CustomerProfilePic[0].imageUrl : null;

        const followerProfile = {
            id: customerProfile.id,
            firstName: customerProfile.firstName,
            lastName: customerProfile.lastName,
            profilePicture

        }

        logger.info(`New follower profile is being sent to vendor:${vendorId}`);
        return WorkerUtil.processResponse(NotificationType.FOLLOW, false, "User has a new follower", followerProfile);
    }

    public async completed({ jobId, returnvalue }: CompletedJob) {
        const job = await this.queue.getJob(jobId);
        const vendorId = job?.data.vendorId;

        await streamRouter.addEvent(
            StreamGroups.NOTIFICATION,
            WorkerUtil.notificationData(StreamEvents.NOTIFY, returnvalue, {
                userType: UserType.VENDOR,
                userId: vendorId,
            }));
    }

}