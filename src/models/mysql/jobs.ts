import { MySQL } from './../../services/mysql';
import { IJobStatus } from './../../controllers/jobController';
import { FieldPacket, QueryError } from 'mysql2';

export interface IJob {
    id: number;
    job: number;
    initiator: string;
    created_at: string;
    completed_at: string;
    last_run_at: string;
    initial_data: any;
    latest_data: any;
    status: number;
    progress: number;
    previous_job_id: number;
}

export class JobsModel {
    public static async selestJobsToRun(limit: number): Promise<[any, FieldPacket[]] | QueryError> {
        const query = `
        SET @LastUpdateID = NULL;
        UPDATE jobs
            INNER JOIN (SELECT id FROM jobs 
                WHERE status = ?
                ORDER BY priority DESC, created_at ASC
                LIMIT 0, ?) as lim USING (id)
            SET status = ?, last_run_at = NOW(), progress = 5
            WHERE status = ?
            AND (SELECT @LastUpdateID := CONCAT_WS(',', jobs.id, @LastUpdateID));
        SELECT @LastUpdateID;
        `;
        const parameters: number[] = [IJobStatus.Queued, limit, IJobStatus.Processing, IJobStatus.Queued];
        try {
            const result = await MySQL.executeTransaction(query, parameters);
            return result;
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async getJobByID(ids: string[]): Promise<IJob[]> {
        const query = `SELECT * FROM jobs WHERE id IN ( ? );`;
        const parameters = [ids];
        try {
            const result = await MySQL.executeTransaction(query, parameters);
            if (result[0].length >= 1) {
                return result[0];
            } else {
                return null;
            }
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async getJobsToTryAgain(): Promise<IJob[]> {
        const query = `
            SELECT * FROM jobs
            WHERE status IN (?)
            AND last_run_at < (NOW() - INTERVAL 15 MINUTE);`;
        const parameters = [[IJobStatus.Processing, IJobStatus.Paused, IJobStatus.Failed, IJobStatus.Hung]];
        try {
            const result = await MySQL.executeTransaction(query, parameters);
            if (result != null) {
                return result[0];
            } else {
                return null;
            }
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async insertNewJobs(jobs: any[]): Promise<[any, FieldPacket[]] | QueryError> {
        const query = `
            INSERT INTO jobs (job, initiator, initial_data, status, progress, previous_job_id)
            VALUES ?;`;
        const parameters = [jobs];
        try {
            const res = await MySQL.executeTransaction(query, parameters);
            return res;
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async terminateOldJobs(ids: number[]): Promise<[any, FieldPacket[]] | QueryError> {
        const query = `UPDATE jobs SET status = ?, progress = -100 WHERE id IN (?);`;
        const parameters = [IJobStatus.Terminated, ids];
        try {
            const res = await MySQL.executeTransaction(query, parameters);
            return res;
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async completeJob(id: number, data: any): Promise<[any, FieldPacket[]] | QueryError> {
        const query = `
            UPDATE jobs SET latest_data = ?, status = ?, progress = 100, completed_at = NOW() WHERE id = ?`;
        const parameters = [JSON.stringify(data), IJobStatus.Completed, id];
        try {
            const res = await MySQL.executeTransaction(query, parameters);
            return res;
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async updateJobProgress(data: any, status: number, progress: number, id: number): Promise<boolean> {
        const query = `
            UPDATE jobs SET latest_data = ?, status = ?, progress = ? WHERE id = ?`;
        const parameters = [JSON.stringify(data), status, progress, id];
        try {
            const res = await MySQL.executeTransaction(query, parameters);
            return true;
        } catch (transactionError) {
            throw transactionError;
        }
    }
}
