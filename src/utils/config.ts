import { ISchedulerOptions } from "../system/scheduler";

export class Config {
    public static matchConfigToEnvVars(config: ISchedulerOptions): ISchedulerOptions {
        const confirmedConfig: ISchedulerOptions = {};

        if (config.jobRunTime == null) {
            confirmedConfig.jobRunTime = process.env.NS_RUN_CRON.toString();
        } else {
            confirmedConfig.jobRunTime = config.jobRunTime;
        }

        if (config.resetJobTime == null) {
            confirmedConfig.resetJobTime = process.env.NS_RERUN_CRON.toString();
        } else {
            confirmedConfig.resetJobTime = config.resetJobTime;
        }

        if (config.mysql == null) {
            confirmedConfig.mysql = process.env.NS_USE_MYSQL == null ? false : process.env.NS_USE_MYSQL === 'true';
        } else {
            confirmedConfig.mysql = config.mysql;
        }

        if (config.redis == null) {
            confirmedConfig.redis = process.env.NS_USE_REDIS == null ? false : process.env.NS_USE_REDIS === 'true'
        } else {
            confirmedConfig.redis = config.redis;
        }

        if (config.postgres == null) {
            confirmedConfig.postgres = process.env.NS_USE_POSTGRES == null ? false : process.env.NS_USE_POSTGRES === 'true'
        } else {
            confirmedConfig.postgres = config.postgres;
        }

        if (config.mongodb == null) {
            confirmedConfig.mongodb = process.env.NS_USE_MONGO == null ? false : process.env.NS_USE_MONGO === 'true';
        } else {
            confirmedConfig.mongodb = config.mongodb;
        }

        if (config.maxConcurrentJobs == null) {
            confirmedConfig.maxConcurrentJobs = parseInt(process.env.NS_RERUN_CRON);
        } else {
            confirmedConfig.maxConcurrentJobs = config.maxConcurrentJobs;
        }

        const validatedResults = Config.validate(confirmedConfig);
        if (validatedResults != null) {
            throw new Error(validatedResults);
        }
        return confirmedConfig;
    }

    /**
     * Checks for any null config values
     * @param config 
     */
    private static validate(config: ISchedulerOptions): string {
        let errors: string = '';
        for (let option in config) {
            const isInvalid = Config.isInvalidOption(config[option]);
            console.log(isInvalid)
            if(isInvalid === false) {
                errors += `\n Config option ${option} is invalid - ${config[option]}`;
            }
        }
        return errors;
    }

    private static isInvalidOption(option: any): boolean {
        const t = typeof(option);
        const i = isNaN(option);
        console.log(t, i)
        return (typeof (option) === 'undefined' || isNaN(option) === true);
    }
}