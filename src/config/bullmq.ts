import { Queue } from 'bullmq';
import { redisBull } from '.';
import { Queues } from '../types/enums';


export const myQueue = new Queue(Queues.MY_QUEUE, { connection: redisBull });
export const uploadQueue = new Queue(Queues.UPLOAD, { connection: redisBull });