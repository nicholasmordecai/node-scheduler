import { IJob } from "../models/mysql/jobs";
import { EventEmitter } from "events";
import { IJobStatus } from "../controllers/jobController";

export class Job {
    public jobInfo: IJob;
    private eventEmitter: EventEmitter;

    constructor(job: IJob, eventEmitter: EventEmitter) {
        this.jobInfo = job;
        try {
            this.jobInfo.initial_data = JSON.parse(this.jobInfo.initial_data);
        } catch (error) {}
        try {
            this.jobInfo.latest_data = JSON.parse(this.jobInfo.latest_data);
        } catch (error) {}
        this.eventEmitter = eventEmitter;
    }

    public updateData(key: string, data: any) {
        if (this.jobInfo.latest_data == null) {
            this.jobInfo.latest_data = {};
        }

        this.jobInfo.latest_data[key] = data;
    }

    public progressUpdate(): boolean {
        this.eventEmitter.emit('jobProgressUpdate', this.jobInfo);
        return true;
    }

    public complete(): boolean {
        this.eventEmitter.emit('jobCompleted', this.jobInfo);
        return true;
    }

    public errored(error: Error): boolean {
        this.jobInfo.status = IJobStatus.Failed;
        this.jobInfo.progress = -100;
        this.updateData('error', error);
        this.eventEmitter.emit('jobErrored', this.jobInfo);
        return true;
    }
}