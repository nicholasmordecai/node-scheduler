import { IJob } from '../models/mysql/jobs';
import { Job } from './job';
import { EventEmitter } from 'events';
import { JobController } from './../controllers/jobController';

export class QueueManager {
    private static instance: QueueManager;    
    private jobsInProgress: number;
    private maxJobsInProgress: number;
    private taskReferences = {};

    public readonly eventEmitter: EventEmitter = new EventEmitter();

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
            QueueManager.instance.jobsInProgress = 0;
            QueueManager.instance.maxJobsInProgress = 100;
        }
        return QueueManager.instance;
    }

    public listenToEvents() {
        this.eventEmitter.on('jobCompleted', this.jobCompleted);
        this.eventEmitter.on('jobProgressUpdate', this.jobProgressUpdate);
        this.eventEmitter.on('jobErrored', this.jobErrored);
    }

    public async runJobs() {
        if (this.jobsInProgress >= this.maxJobsInProgress) {
            // emit an event to say that the queue maneger is maxed out
            return null;
        }

        const jobs: IJob[] = await JobController.getNextBatchOfJobs(this.maxJobsInProgress - this.jobsInProgress);
        if (jobs == null) {
            return null;
        }
        this.jobsInProgress = jobs.length;
        for (let jobRow of jobs) {
            try {
                const newJob = new Job(jobRow, this.eventEmitter);
                try {
                    this.taskReferences[jobRow.job](newJob);
                } catch (jobError) {
                    newJob.errored(jobError);
                }
            } catch (error) {
                // emit a new error here?
            }
        }
    }

    public async resetHungJobs(): Promise<void> {
        await JobController.scheduleReRunOfJobs();
    }

    public async jobCompleted(job: IJob): Promise<void> {
        this.jobsInProgress -= 1;
        job.progress = 100;
        await JobController.markJobAsCompleted(job);
    }

    public async jobProgressUpdate(job: IJob): Promise<void> {
        await JobController.updateJobProgress(job);
    }

    public async jobErrored(job: IJob): Promise<void> {
        this.jobsInProgress -= 1;
        await JobController.updateJobProgress(job);
    }

    public registerTask(id: number, fn: (job: IJob) => void): void {
        this.taskReferences[id] = fn;
    }
}
