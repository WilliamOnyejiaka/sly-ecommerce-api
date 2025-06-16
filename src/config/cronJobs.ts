import cron from 'node-cron';
import logger from './logger';
import https from 'https';

const task1 = cron.schedule('*/14 * * * *', async () => {
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

// Export tasks to control them (e.g., start/stop)
const cronJobs = {
    start: () => {
        task1.start();
        console.log('Cron jobs started');
    },
    stop: () => {
        task1.stop();
        console.log('Cron jobs stopped');
    },
};

export default cronJobs;