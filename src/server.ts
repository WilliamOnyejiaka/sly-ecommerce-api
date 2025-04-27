import cluster, { Worker } from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env } from "./config";
import { redisClient, redisPub } from "./config";

const app = createApp();
let environmentType = env('envType');
const PORT = env('port');
const REDIS_CHANNEL = "publish:change";
const REDIS_ACTIVE_PUBLISHER_KEY = "cluster:active_publisher";
const REDIS_HEARTBEAT_KEY = "cluster:heartbeat";

function startServer() {
    const REDIS_ACTIVE_PUBLISHER = "cluster:active_publisher";

    const numCpu = os.cpus().length - 1;
    const workers: Worker[] = [];


    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) {
            const worker = cluster.fork();
            workers.push(worker);
        }

        let currentIndex = 0;


        async function switchPublisher() {
            if (workers.length === 0) return;

            const aliveWorkers = workers.filter(w => w.isConnected());
            if (aliveWorkers.length === 0) return;

            const currentWorker = aliveWorkers[currentIndex % aliveWorkers.length];
            console.log(`Switching active publisher to Worker ${currentWorker.id} (PID ${currentWorker.process.pid})`);

            await redisClient.set(REDIS_ACTIVE_PUBLISHER, currentWorker.id.toString());

            currentIndex++;
        }

        // Switch publisher every 5 seconds
        setInterval(switchPublisher, 10000);

        cluster.on("exit", async (worker, code, signal) => {
            console.log(`Worker ${worker.id} (PID ${worker.process.pid}) died.`);

            const activePublisher = await redisClient.get(REDIS_ACTIVE_PUBLISHER);
            if (activePublisher === worker.id.toString()) {
                console.log(`Dead worker was the active publisher. Switching now...`);
                await switchPublisher(); // Elect new publisher immediately
            }

            // Remove from our workers list
            const idx = workers.findIndex(w => w.id === worker.id);
            if (idx !== -1) workers.splice(idx, 1);

            // Optionally: Restart a new worker
            const newWorker = cluster.fork();
            workers.push(newWorker);
        });
    } else {
        app.listen(PORT, () => {
            console.log(`pid - ${process.pid}`);
            console.log(`server running on port - ${PORT}\n`)
        });
    }
}


// function startServer() {
//     // const REDIS_CHANNEL = "publish:change";

//     if (cluster.isPrimary) {
//         const numCPUs = os.cpus().length;
//         const workers: Worker[] = [];

//         // Fork workers
//         for (let i = 0; i < numCPUs; i++) {
//             const worker = cluster.fork();
//             workers.push(worker);
//         }

//         let currentIndex = 0;

//         // Every 5 seconds, switch the active worker
//         setInterval(async () => {
//             if (workers.length === 0) return;

//             const currentWorker = workers[currentIndex % workers.length];
//             console.log(`Master: Switching active publisher to Worker ${currentWorker.id} (PID ${currentWorker.process.pid})`);

//             // Publish the new active worker ID
//             await redisPub.publish(REDIS_CHANNEL, currentWorker.id.toString());

//             // Update the active publisher in Redis
//             await redisClient.set(REDIS_ACTIVE_PUBLISHER_KEY, currentWorker.id.toString());

//             currentIndex++;
//         }, 5000);

//         // Handle worker exit events
//         cluster.on("exit", async (worker, code, signal) => {
//             console.log(`Worker ${worker.id} (PID ${worker.process.pid}) died`);

//             // If the dead worker was the active one, switch to the next one
//             const activeWorkerId = await redisClient.get(REDIS_ACTIVE_PUBLISHER_KEY);

//             if (worker.id.toString() === activeWorkerId) {
//                 console.log(`Active publisher died! Switching immediately...`);
//                 const nextWorker = workers[(currentIndex + 1) % workers.length];
//                 await redisPub.publish(REDIS_CHANNEL, nextWorker.id.toString());
//                 await redisPub.set(REDIS_ACTIVE_PUBLISHER_KEY, nextWorker.id.toString());
//             }
//         });

//     }
//     else {
//         app.listen(PORT, () => {
//             console.log(`pid - ${process.pid}`);
//             console.log(`server running on port - ${PORT}\n`)
//         });
//     }
// }

// function startServer() {
// const REDIS_ACTIVE_PUBLISHER = "cluster:active_publisher";

//     const numCpu = os.cpus().length - 1;
//     const workers: Worker[] = [];


//     if (cluster.isPrimary) {
//         for (let i = 0; i < numCpu; i++) {
//             const worker = cluster.fork();
//             workers.push(worker);
//         }

//         let currentIndex = 0;


//         async function switchPublisher() {
//             if (workers.length === 0) return;

//             const aliveWorkers = workers.filter(w => w.isConnected());
//             if (aliveWorkers.length === 0) return;

//             const currentWorker = aliveWorkers[currentIndex % aliveWorkers.length];
//             console.log(`Switching active publisher to Worker ${currentWorker.id} (PID ${currentWorker.process.pid})`);

//             await redisClient.set(REDIS_ACTIVE_PUBLISHER, currentWorker.id.toString());

//             currentIndex++;
//         }

//         // Switch publisher every 5 seconds
//         setInterval(switchPublisher, 5000);

//         cluster.on("exit", async (worker, code, signal) => {
//             console.log(`Worker ${worker.id} (PID ${worker.process.pid}) died.`);

//             const activePublisher = await redisClient.get(REDIS_ACTIVE_PUBLISHER);
//             if (activePublisher === worker.id.toString()) {
//                 console.log(`Dead worker was the active publisher. Switching now...`);
//                 await switchPublisher(); // Elect new publisher immediately
//             }

//             // Remove from our workers list
//             const idx = workers.findIndex(w => w.id === worker.id);
//             if (idx !== -1) workers.splice(idx, 1);

//             // Optionally: Restart a new worker
//             const newWorker = cluster.fork();
//             workers.push(newWorker);
//         });
//     } else {
//         app.listen(PORT, () => {
//             console.log(`pid - ${process.pid}`);
//             console.log(`server running on port - ${PORT}\n`)
//         });
//     }
// }

if (environmentType == "dev") {
    app.listen(PORT, () => console.log(`server running on port - ${PORT}`));
} else {
    startServer();
}