require('dotenv').config({ path: '.env' });

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // throw error event here
});

import { Scheduler, ISchedulerOptions } from './system/scheduler';

class Main {
    public static start() {
        const options: ISchedulerOptions = {
            jobRunTime: '0 * * * * *',
            resetJobTime: '0 * * * * *'
        }
        new Scheduler(options);
    }
}

Main.start();