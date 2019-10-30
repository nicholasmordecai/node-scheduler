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
            this.events.emit('jobRunning', {time: Date.now()});
            QueueManager.getInstance().runJobs();
            return true;
        } catch (error) {
            this.events.emit('runError', {error: error, time: Date.now()});
            throw error;
        }
    }

    public runJobReset() {
        try {
            this.events.emit('resetRunning', {time: Date.now()});
            QueueManager.getInstance().resetHungJobs();
            return true;
        } catch (error) {
            this.events.emit('resetError', {error: error, time: Date.now()});
            throw error;
        }
    }
}