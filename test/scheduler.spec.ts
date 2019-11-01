import * as should from 'should';
import { Scheduler } from '../src/system/scheduler';
import { Utils } from './utils';

describe('Scheduler Class', () => {

    it('Creates an instance of the scheduler class', (done: Mocha.Done) => {

        const scheduler = new Scheduler({});
        should(scheduler).be.instanceOf(Scheduler);
        done();
    });

    it('The cron calls the run jobs and re-run jobs functions', async () => {
        const scheduler = new Scheduler({});
        const t1 = scheduler.runJobs();
        const t2 = scheduler.runJobReset();
        await Utils.timeout(15);

        should(t1).be.Boolean().and.be.exactly(true);
        should(t2).be.Boolean().and.be.exactly(true);
    });
});