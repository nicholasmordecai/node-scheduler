import { ISchedulerOptions } from "../system/scheduler";

interface IConfigExample {
    env: string;
    required: boolean;
    type: string;
}
export class Config {
    private static readonly emptyConfig: { [key: string]: IConfigExample } = {
        jobRunTime: { env: 'NS_RUN_CRON', required: true, type: 'string' },
        resetJobTime: { env: 'NS_RERUN_CRON', required: true, type: 'string' },
        mysql: { env: 'NS_USE_MYSQL', required: false, type: 'boolean' },
        redis: { env: 'NS_USE_REDIS', required: false, type: 'boolean' },
        postgres: { env: 'NS_USE_POSTGRES', required: false, type: 'boolean' },
        mongodb: { env: 'NS_USE_MONGO', required: false, type: 'boolean' },
        maxConcurrentJobs: { env: 'NS_MAX_JOBS', required: false, type: 'number' },
    }

    public static matchConfigToEnvVars(config: ISchedulerOptions): ISchedulerOptions {
        const confirmedConfig: ISchedulerOptions = {};
        let throwError: boolean = false;
        let errorString: string = '';

        for (let key in Config.emptyConfig) {
            const ex: IConfigExample = Config.emptyConfig[key];
            const envVar = process.env[ex.env];

            // get the environment 
            if (envVar != null) {
                try {
                confirmedConfig[key] = Config.castToCorrectType(envVar, ex.type);
                } catch (reason) {
                    throwError = true;
                    errorString += reason + ` for config option: ${key}`;
                }
            }

            // lastly, use the config passed to override any environment variables
            if (config[key] != null && typeof (config[key]) === ex.type) {
                confirmedConfig[key] = config[key];
            }
        }

        for (let key in Config.emptyConfig) {
            // if the option is required, however it doesn't exist then throw error
            if (Config.emptyConfig[key].required === true && confirmedConfig[key] == null) {
                errorString += `\n Missing config option: ${key} of type ${Config.emptyConfig[key].type}`;
                throwError = true;

                // break the loop here, as there is no point checking type of a missing option
                continue;
            }

            // check if the type of the config is as expected
            const configType = typeof (confirmedConfig[key]);
            if (configType !== Config.emptyConfig[key].type) {
                errorString += `\n Invalid config type for option: ${key}. \n\tExpected (${Config.emptyConfig[key].type}) --- Actual (${typeof (confirmedConfig[key])})`;
                throwError = true;
            }
        }

        if (throwError === true) {
            throw errorString;
        }

        return confirmedConfig;
    }

    private static castToCorrectType(variable: any, type: string) {
        switch (type) {
            case 'string':
                return variable.toString();
            case 'boolean':
                return Config.getBoolean(variable);
            case 'number':
                return parseInt(variable);
            case 'bigint':
                return parseInt(variable);
            case 'undefined':
                throw (`Config variable: ${variable} is of type undefined`);
        }
    }

    private static getBoolean(value: boolean | number | string): boolean {
        if(value === true || value === 'true' || value === 1 || value === '1' || value === 'yes') {
            return true;
        } else if (value === false || value === 'false' || value === 0 || value === '0' || value === 'no') {
            return false;
        } else {
            throw `\n Could not correctly parse boolean - ${value}`;
        }
    }
}