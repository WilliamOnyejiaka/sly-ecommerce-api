import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env, logger } from "./config";
import { Application } from "express";
import { createSecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2';
import { readFileSync } from 'fs';

const CERT_DIR = `./cert`;
const options = {
    key: readFileSync(`${CERT_DIR}/server.key`),
    cert: readFileSync(`${CERT_DIR}/server.cert`),
};

// const options = {
//     key: env('sslKey')!,
//     cert: env('sslCert')!,
// };


const app = createApp();
let environmentType = env('envType');
const PORT = Number(env('port')!);
const server = createSecureServer(options, app)

function startServer() {
    const numCpu = os.cpus().length;

    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            cluster.fork();
        });
    } else {
        server.listen(3000)

        // server.listen(PORT, () => {
        //     console.log(`pid - ${process.pid}`);
        //     console.log(`HTTP/2 server running on port - ${PORT}\n`)
        // });
        // app.listen(PORT, () => {
        //     console.log(`pid - ${process.pid}`);

        //     console.log(`server running on port - ${PORT}\n`)
        // });
        // // start(app, PORT, process.pid)
    }
}

if (environmentType == "dev") {
    // app.listen(PORT, () => console.log(`server running on port - ${PORT}`));
    // start(app, PORT);
    server.listen(3000)
} else {
    startServer();
}