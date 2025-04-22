import Redis from "ioredis";
import { Job, Queue } from "bullmq";

export interface UploadedImageData {
    mimeType: string;
    imageUrl: string;
    publicId: string;
    size: number;
}

export interface UploadResult {
    success: boolean;
    data?: Record<string, UploadedImageData>;
    error?: { fieldName: string; message: string }[];
    publicIds?: string[]
}

export type UploadedFiles = {
    publicId: string,
    size: string,
    url: string,
    mimeType: string,
    thumbnail: string | null,
    duration: string | null
};

export type FailedFiles = {
    filename: string,
    error: string
};


export interface EventHandler {
    (event: any, stream: string, id: string, io?: any): Promise<void>;
}

export interface StreamGroup {
    stream: string; // e.g., 'stream:profile'
    consumerGroup: string; // e.g., 'profile-consumers'
    handlers: Map<string, EventHandler>; // e.g., 'ProfileUpdated' -> handler
}

export interface WorkerConfig { connection: Redis, concurrency?: number, limiter?: { max: number, duration: number } };

export interface CompletedJob { jobId: string, returnvalue: any };
export interface FailedJob { jobId: string, failedReason: any }


export interface IWorker<T> {
    process: (job: Job<T>) => any,
    completed?: ({ jobId, returnvalue }: CompletedJob) => void,
    failed?: ({ jobId, failedReason }: FailedJob) => void,
    drained?: () => void,
    config: WorkerConfig,
    queueName: string,
    queue: Queue,
    eventName: string
};