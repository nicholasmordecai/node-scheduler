import * as should from 'should';
import { QueueManager } from '../src/system/queueManager';
import { MySQL } from './../src/services/mysql';
import { Utils } from './utils';
import { IJob } from '../src/models/mysql/jobs';

describe('Queue Manager', () => {
    beforeEach(async () => {
        await MySQL.execute('TRUNCATE jobs;', []);
    });

    it('Is the correct instance', (done: Mocha.Done) => {
        should(QueueManager.getInstance()).be.instanceOf(QueueManager);
        done();
    });

    it('Creates the correct number of events', (done: Mocha.Done) => {
        QueueManager.getInstance().listenToEvents();
        should(QueueManager.getInstance().eventEmitter.eventNames().length).be.Number().and.be.exactly(3);
        done();
    });

    it('Should run two correct jobs and fail a third job', async () => {
        // setup correct data
        const insertRows = [
            [0, 'test', 0, JSON.stringify({})],
            [0, 'test', 0, JSON.stringify({})],
            [-1, 'test', 0, JSON.stringify({})]
        ];
        await MySQL.execute(`INSERT INTO jobs (job, initiator, status, initial_data) VALUES ?`, [insertRows]);

        await QueueManager.getInstance().runJobs();

        // wait 100ms for the jobs to complete
        await Utils.timeout(100);

        const newJobs = await MySQL.execute('SELECT * FROM jobs;', []);
        const job1: IJob = newJobs[0][0];
        const job2: IJob = newJobs[0][1];
        const job3: IJob = newJobs[0][2];

        should(job1.id).be.Number().and.be.exactly(1);
        should(job1.progress).be.Number().and.be.exactly(100);
        should(job1.status).be.Number().and.be.exactly(7);

        should(job2.id).be.Number().and.be.exactly(2);
        should(job2.progress).be.Number().and.be.exactly(100);
        should(job2.status).be.Number().and.be.exactly(7);

        should(job3.id).be.Number().and.be.exactly(3);
        should(job3.progress).be.Number().and.be.exactly(-100);
        should(job3.status).be.Number().and.be.exactly(3);
    });

    it('Should schedule a new job based of the failed one', async () => {
        // setup correct data
        const time: Date = new Date();
        time.setHours(time.getHours() - 2);
        const last_run_at: string = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const insertRows = [
            [0, 'test', 3, JSON.stringify({ test: true }), last_run_at]
        ];
        await MySQL.execute(`INSERT INTO jobs (job, initiator, status, initial_data, last_run_at) VALUES ?`, [insertRows]);

        await QueueManager.getInstance().resetHungJobs();

        // wait 100ms for the jobs to complete
        await Utils.timeout(100);

        const newJobs = await MySQL.execute('SELECT * FROM jobs;', []);
        const job1: IJob = newJobs[0][0];
        const job2: IJob = newJobs[0][1];

        should(job1.id).be.Number().and.be.exactly(1);
        should(job1.progress).be.Number().and.be.exactly(-100);
        should(job1.status).be.Number().and.be.exactly(6);
        should(job1.initial_data).be.Object().and.be.deepEqual({ test: true });

        should(job2.id).be.Number().and.be.exactly(2);
        should(job2.progress).be.Number().and.be.exactly(0);
        should(job2.status).be.Number().and.be.exactly(0);
        should(job2.initial_data).be.Object().and.be.deepEqual({ test: true });
        should(job2.previous_job_id).be.Number().and.be.exactly(1);
    });
})
