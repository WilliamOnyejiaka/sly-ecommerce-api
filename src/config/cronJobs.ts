import cron from 'node-cron';
import streamRouter from './redisStream';
import logger from './logger';
import https from 'https';

const task1 = cron.schedule('*/1 * * * *', async () => {
    logger.info("Hello");
    https.get("https://ecommerce-api-iv1q.onrender.com/greet", res => {
        if (res.statusCode === 200) {
            logger.http("Keeping server running");
        } else {
            logger.http("Failed to consume: ", res.statusCode);
        }
    }).on('error', e => {
        console.log("Error: ", e);
    });
}, {
    scheduled: true,
    timezone: 'UTC'
});
const task2 = cron.schedule('*/5 * * * *', async () => {
    console.log('Starting dlq clean up');
    await streamRouter.startDlqCleanup();
}, {
    scheduled: true,
    timezone: 'UTC'
});


// Export tasks to control them (e.g., start/stop)
const cronJobs = {
    start: () => {
        task1.start();
        // task2.start();
        console.log('Cron jobs started');
    },
    stop: () => {
        task1.stop();
        // task2.stop();
        console.log('Cron jobs stopped');
    },
};

export default cronJobs;