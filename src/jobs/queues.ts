import { Queue } from 'bullmq';
import { redisBull } from '../config';
import { Queues } from '../types/enums';

const config = { connection: redisBull }
export const myQueue = new Queue(Queues.MY_QUEUE, { connection: redisBull });
export const uploadQueue = new Queue(Queues.UPLOAD, { connection: redisBull });
export const createStoreQueue = new Queue(Queues.CREATE_STORE, { connection: redisBull });
export const uploadProductQueue = new Queue(Queues.UPLOAD_PRODUCT, config);
export const notifyCustomersQueue = new Queue(Queues.NOTIFY_CUSTOMERS, config);

