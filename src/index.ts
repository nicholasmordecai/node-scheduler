require('dotenv').config({ path: '.env' });
require('source-map-support').install();

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // throw error event here
});

import { Scheduler } from './system/scheduler';

class Main {
    public static start() {
        new Scheduler('0 * * * * *', '0 * * * * *');
    }
}

Main.start();