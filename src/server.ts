import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env, logger } from "./config";
import { Application } from "express";
import { createSecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2';
import { readFileSync } from 'fs';
import spdy from "spdy";

// const options = {
//     key: readFileSync('key.pem'), // Path to your private key
//     cert: readFileSync('cert.pem'), // Path to your certificate
// };

// const options = {
//     key: Buffer.from(env('sslKey')!, 'base64'), // Path to your private key
//     cert: Buffer.from(env('sslCert')!, 'base64'), // Path to your certificate
// };


const CERT_DIR = `./cert`;
const options = {
    key: readFileSync(`${CERT_DIR}/server.key`),
    cert: readFileSync(`${CERT_DIR}/server.cert`),
}

// Create and start HTTP/2 server
// function startHTTP2Server(app: Application, port: number, pid?: number) {
//     // console.log(options);

//     const server = spdy.createServer(options, app);

//     server.listen(port, () => {
//         if (pid) logger.info(`pid - ${process.pid}`);

//         logger.info(`HTTP/2 server running on https://localhost:${port}`);
//     });
// }



// Create and start HTTP/2 server
function start(app: Application, port: number, pid?: number) {
    const server = createSecureServer(options, (req: Http2ServerRequest, res: Http2ServerResponse) => {
        // Convert HTTP/2 request/response to Express-compatible format
        const expressReq = req as any;
        const expressRes = res as any;
        expressReq.url = req.url;
        expressReq.method = req.method;
        expressReq.headers = req.headers;

        // Handle the request with Express
        app(expressReq, expressRes);
    });

    server.listen(port, () => {
        if (pid) logger.info(`pid - ${process.pid}`);

        logger.info(`HTTP/2 server running on https://localhost:${port}`);
    });
}

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
        app.listen(PORT, () => {
            console.log(`pid - ${process.pid}`);

            console.log(`server running on port - ${PORT}\n`)
        });
        // start(app, PORT, process.pid)
    }
}

if (environmentType == "dev") {
    // app.listen(PORT, () => console.log(`server running on port - ${PORT}`));
    // start(app, PORT);
    server.listen(3000)
} else {
    startServer();
}