// import { Pool, PoolClient, QueryResult } from 'pg';
// let pool: Pool;

// export class Postgres {
//     public static connect(): Pool {
//         if (pool != null) {
//             return pool;
//         } else {
//             pool = new Pool({
//                 user: 'dbuser',
//                 host: 'database.server.com',
//                 database: 'mydb',
//                 password: 'secretpassword',
//                 port: 3211,
//             });
//             return pool;
//         }
//     }


//     public static async execute(query: string, params: Array<any>): Promise<QueryResult<any>> {
//         const pool: Pool = Postgres.connect();
//         const results = await pool.query(query, params);
//         await pool.end();
//         return results;
//     }
// }