import cluster, { Worker } from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env } from "./config";
import { redisClient, redisPub } from "./config";

const app = createApp();
let environmentType = env('envType');
const PORT = env('port');

function startServer() {
    const numCpu = os.cpus().length - 2; //! Be adjusting this

    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            console.log('Starting a new worker');
            cluster.fork();
        });

        cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));
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