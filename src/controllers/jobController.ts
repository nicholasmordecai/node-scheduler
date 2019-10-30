import { JobsModel, IJob } from '../models/mysql/jobs';

export enum IJobStatus {
    Queued = 0,
    Processing = 1,
    Paused = 2,
    Failed = 3,
    Hung = 4,
    Canceled = 5,
    Terminated = 6,
    Completed = 7,
}

export class JobController {

    public static async getNextBatchOfJobs(limit: number): Promise<IJob[]> {
        const ids = await JobController.getNextJobsIDs(limit);
        if (ids.length === 0) {
            // no jobs to process, wait until next tick
            return;
        }
        const jobs: IJob[] = await JobController.getJobsByIDS(ids);
        return jobs;
    }

    private static async getNextJobsIDs(limit: number): Promise<string[]> {
        const jobs = await JobsModel.selestJobsToRun(limit);
        const buffer: Buffer = jobs[0][2][0]['@LastUpdateID'];

        if (buffer == null) {
            return [];
        }

        const ids: string = buffer.toString();
        const newIDs = ids.split(',');
        return newIDs;
    }

    private static async getJobsByIDS(ids: string[]): Promise<IJob[]> {
        return await JobsModel.getJobByID(ids);
    }

    public static async scheduleReRunOfJobs(): Promise<void> {

        const failedJobs = await JobsModel.getJobsToTryAgain();
        if(failedJobs.length === 0) {
            return;
        }
        
        const newJobs: any[] = [];
        const oldIds: number[] = [];
        for (let job of failedJobs) {
            /**
             * create a new job entry in the database linking back to the previous one
             * Fields:
             *  job, initiator, initial_data, status, progress, previous_job_id
             */
            const newJob = [
                job.job,
                'retry',
                JSON.stringify(job.initial_data),
                IJobStatus.Queued,
                0,
                job.id
            ];
            newJobs.push(newJob);
            oldIds.push(job.id)
        }

        await JobsModel.insertNewJobs(newJobs);
        await JobsModel.terminateOldJobs(oldIds);
    }

    public static async markJobAsCompleted(job: IJob) {
        await JobsModel.completeJob(job.id, job.latest_data);
    }

    public static async updateJobProgress(job: IJob) {
        await JobsModel.updateJobProgress(job.latest_data, job.status, job.progress, job.id);
    }
}
