import { CronJob } from 'cron';
import { QueueManager } from './queueManager';
import { EventEmitter } from 'events';
import { Config } from '../utils/config';

export interface ISchedulerOptions {
    jobRunTime?: string;
    resetJobTime?: string;
    mysql?: boolean;
    redis?: boolean;
    postgres?: boolean;
    mongodb?: boolean;
    maxConcurrentJobs?: number;
}

export class Scheduler {
    public events: EventEmitter;

    constructor(options: ISchedulerOptions = {}) {
        const config: ISchedulerOptions = Config.matchConfigToEnvVars(options);
        this.events = new EventEmitter();
        QueueManager.getInstance().listenToEvents();

        new CronJob(config.jobRunTime as string, () => {this.runJobs()});
        this.runJobs();
        // new CronJob(config.resetJobTime, this.runJobReset, null, true);
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