import { MySQL } from './../src/services/mysql';
import * as fs from 'fs';
require('dotenv').config({ path: 'test.env' });

class TestSetup {
    public static createTables(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(__dirname)
                const createTableSql = fs.readFileSync(__dirname + '/db/mysql_create.sql').toString();
                await MySQL.execute(createTableSql, []);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
}

TestSetup.createTables()
    .then((completed) => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });