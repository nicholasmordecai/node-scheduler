import { MySQL } from './../../services/mysql';
import { FieldPacket, QueryError } from 'mysql2';

export interface ISent {
    id: number;
    playerId: number;
    emailType: number;
    stamp: string;
}

export class SentModel {
    public static async selectEmailsSent(playerID: number, emailType: number): Promise<[ISent]> {
        const query = `
        SELECT * FROM sent 
            WHERE playerId = ?
            AND emailType = ?
        ORDER BY stamp DESC;
        `;
        const parameters: number[] = [playerID, emailType];
        try {
            const result = await MySQL.executeTransaction(query, parameters);
            return result[0];
        } catch (transactionError) {
            throw transactionError;
        }
    }

    public static async insertSentRecord(playerID: number, emailType: number): Promise<[any, FieldPacket[]] | QueryError> {
        const query = `INSERT INTO sent (playerId, emailType) VALUES (?, ?)`;
        const parameters: number[] = [playerID, emailType];
        try {
            const result = await MySQL.executeTransaction(query, parameters);
            return result;
        } catch (transactionError) {
            throw transactionError;
        }
    }
}
