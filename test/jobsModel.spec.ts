import * as should from 'should';
require('dotenv').config({ path: 'test.env' });
import { JobsModel, IJob } from '../src/models/mysql/jobs';
import { MySQL } from '../src/services/mysql';
import { FieldPacket } from 'mysql2';

describe('MySQL Job Queries', () => {

    beforeEach(async () => {
        await MySQL.execute('TRUNCATE jobs', []);

    });

    it('Able to query the jobs table', async () => {
        const jobs = await JobsModel.selestJobsToRun(100);
        should(jobs).be.Array();
        should(jobs[0][0].fieldCount).be.exactly(0);
    });

    it('Gets 2 jobs to run', async () => {
        // setup correct data
        const insertRows = [
            [1, 'test', 0, JSON.stringify({})],
            [3, 'test', 0, JSON.stringify({})],
            [2, 'test', 1, JSON.stringify({})]
        ];
        await MySQL.execute(`INSERT INTO jobs (job, initiator, status, initial_data) VALUES ?`, [insertRows])

        // run the mysql query
        const jobs = await JobsModel.selestJobsToRun(2) as [any, FieldPacket[]];

        // test the responses
        should(jobs).be.Array();
        should(jobs.length).be.exactly(2);
        const buffer: Buffer = jobs[0][2][0]['@LastUpdateID'];
        const ids: string = buffer.toString();
        should(ids).be.String().and.be.exactly('2,1');
        const newIDs = ids.split(',');
        should(newIDs).be.Array().and.be.eql(['2', '1']);
    });

    it('Get job by id - returns null', async () => {
        // run the mysql query
        const jobs = await JobsModel.getJobByID(['1']) as [any, FieldPacket[]];
        // test the responses
        should(jobs).be.Null();
    });

    it('Gets correct job by id', async () => {
        // setup correct data
        const insertRows = [
            [1, 'test', 0, JSON.stringify({})],
            [3, 'test', 0, JSON.stringify({})],
            [2, 'test', 1, JSON.stringify({})]
        ];
        await MySQL.execute(`INSERT INTO jobs (job, initiator, status, initial_data) VALUES ?`, [insertRows])

        // run the mysql query
        const jobs = await JobsModel.getJobByID(['2']) as [any, FieldPacket[]];

        // test the responses
        should(jobs).be.Array();
        should(jobs.length).be.exactly(1);
        should(jobs[0].id).be.Number().and.be.exactly(2);
    });

    it('Gets jobs to re-run', async () => {
        const time: Date = new Date();
        time.setHours(time.getHours() - 2);
        const last_run_at: string = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // setup correct data
        const insertRows = [
            [1, 'test', 0, last_run_at, last_run_at, JSON.stringify({})],
            [3, 'test', 2, last_run_at, last_run_at, JSON.stringify({})],
            [2, 'test', 1, last_run_at, last_run_at, JSON.stringify({})]
        ];
        await MySQL.executeTransaction(`INSERT INTO jobs (job, initiator, status, created_at, last_run_at, initial_data) VALUES ?`, [insertRows]);

        // run the mysql query
        const jobs = await JobsModel.getJobsToTryAgain() as [any, FieldPacket[]];
        // test the responses
        should(jobs).be.Array();
        should(jobs.length).exactly(2);
        should(jobs[0].id).be.Number().and.exactly(2);
    });

    it('Creats a new job from a failed one', async () => {
        // setup correct data
        const insertRows = [
            [1, 'test', 3, JSON.stringify({name: 'nick'})],
        ];
        await MySQL.executeTransaction(`INSERT INTO jobs (job, initiator, status, initial_data) VALUES ?`, [insertRows]);
        const result = await MySQL.executeTransaction('SELECT * FROM jobs WHERE id = 1', []);
        const job = [
            result[0][0].job,
            'retry',
            JSON.stringify(result[0][0].initial_data),
            0,
            0,
            result[0][0].id
        ];

        // run the mysql query
        await JobsModel.insertNewJobs([job]);

        // test the responses
        const secondRes = await MySQL.executeTransaction('SELECT * FROM jobs WHERE id = 2', []);
        const newJob: IJob = secondRes[0][0];
        should(newJob.id).be.Number().and.be.exactly(2);
        should(newJob.previous_job_id).be.Number().and.be.exactly(1);
    });

    it('Terminates a job', async () => {
        // setup correct data
        const insertRows = [
            [1, 'test', 6, JSON.stringify({})],
        ];
        await MySQL.executeTransaction(`INSERT INTO jobs (job, initiator, status, initial_data) VALUES ?`, [insertRows]);

        // run the mysql query
        await JobsModel.terminateOldJobs([1]);

        // test the responses
        const rows = await MySQL.executeTransaction('SELECT * FROM jobs WHERE id = 1', []);

        const job: IJob = rows[0][0];
        should(job.id).be.Number().and.be.exactly(1);
        should(job.status).be.Number().and.be.exactly(6);
        should(job.progress).be.Number().and.be.exactly(-100);
    });

});