import { CronJob } from 'cron';
import { QueueManager } from './queueManager';
import { EventEmitter } from 'events';

export interface ISchedulerOptions {
    jobRunTime?: string;
    resetJobTime?: string;
    mysql?: boolean;
    redis?: boolean;

}

export class Scheduler {
    public events: EventEmitter;

    constructor(options?: ISchedulerOptions) {
        if(!options.jobRunTime) {
            options.jobRunTime = process.env.NS_RUN_CRON;
        }

        if(!options.resetJobTime) {
            options.resetJobTime = process.env.NS_RERUN_CRON;
        }

        this.events = new EventEmitter();
        QueueManager.getInstance().listenToEvents();

        new CronJob(options.jobRunTime, () => {this.runJobs()});
        new CronJob(options.resetJobTime, this.runJobReset, null, true);
    }

    public runJobs() {
        try {
            this.events.emit('schedulerRunning', {time: Date.now()});
            QueueManager.getInstance().runJobs();
            return true;
        } catch (error) {
            this.events.emit('schedulerError', {error: error, time: Date.now()});
            throw error;
        }
    }

    public runJobReset() {
        try {
            this.events.emit('schedulerResetRunning', {time: Date.now()});
            QueueManager.getInstance().resetHungJobs();
            return true;
        } catch (error) {
            this.events.emit('schedulerResetError', {error: error, time: Date.now()});
            throw error;
        }
    }
}