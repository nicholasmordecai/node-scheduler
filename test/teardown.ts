import { MySQL } from './../src/services/mysql';
import * as fs from 'fs';
require('dotenv').config({ path: 'test.env' });

class TestTeardown {
    public static removeTables(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const removeTablesSql = fs.readFileSync(__dirname + '/db/mysql_destroy.sql', 'utf8');
                await MySQL.execute(removeTablesSql, []);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
}

TestTeardown.removeTables()
    .then((completed) => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })