import cluster, { Worker } from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env } from "./config";
import { redisClient, redisPub } from "./config";

const app = createApp();
let environmentType = env('envType');
const PORT = env('port');

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

            try {
                const currentWorker = aliveWorkers[currentIndex % aliveWorkers.length];
                console.log(`Switching active publisher to Worker ${currentWorker.id} (PID ${currentWorker.process.pid})`);

                await redisClient.set(REDIS_ACTIVE_PUBLISHER, currentWorker.id.toString());

                currentIndex++;
            } catch (error) {
                console.log("An error occurred in the switchPublisher function: ", error);
            }
        }

        // Switch publisher every 10 seconds
        setInterval(switchPublisher, 10000);

        cluster.on("exit", async (worker, code, signal) => {
            console.log(`Worker ${worker.id} (PID ${worker.process.pid}) died.`);

            let activePublisher;
            try {
                activePublisher = await redisClient.get(REDIS_ACTIVE_PUBLISHER);
            } catch (error: any) {
                console.log("An error occurred in the cluster on exit: ", error);
            }

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

if (environmentType == "dev") {
    app.listen(PORT, () => console.log(`server running on port - ${PORT}`));
} else {
    startServer();
}