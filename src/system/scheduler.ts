import { CronJob } from 'cron';
import { QueueManager } from './queueManager';
import { EventEmitter } from 'events';

export class Scheduler {
    public events: EventEmitter;

    constructor(jobRunTime: string, resetJobTime: string) {
        this.events = new EventEmitter();
        QueueManager.getInstance().listenToEvents();
        new CronJob(jobRunTime, () => {this.runJobs()});
        new CronJob(resetJobTime, this.runJobReset, null, true);
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