import { createPool, Pool, PoolConnection, FieldPacket, QueryError } from 'mysql2/promise';
let userPool: Pool;

export class MySQL {

    public static async getUserPool(): Promise<PoolConnection> {
        if (!userPool) {
            userPool = createPool({
                host: process.env.MYSQL_DB_HOST,
                user: process.env.MYSQL_DB_USER,
                password: process.env.MYSQL_DB_PASSWORD,
                database: process.env.MYSQL_DB_DATABASE,
                port: 3306,
                multipleStatements: true,
            });
        }

        return userPool.getConnection();
    }

    public static async execute(query: string, params: Array<any>): Promise<[any, FieldPacket[]] | QueryError> {
        const connection: PoolConnection = await MySQL.getUserPool();
        try {
            const result = await connection.query(query, params);
            connection.release();
            return result;
        } catch (queryError) {
            connection.release();
            throw new Error(queryError);
        }
    }

    public static async executeTransaction(query: string, params: Array<any>): Promise<[any, FieldPacket[]] | QueryError> {
        const connection: PoolConnection = await MySQL.getUserPool();
        try {
            await connection.beginTransaction();
            const result: [any, FieldPacket[]] = await connection.query(query, params);
            await connection.commit();
            connection.release();
            return result;
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw new Error(error);
        }
    }
}
