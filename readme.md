# Node Scheduler

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Node Scheduler is a task scheduler & runner by using a persistant storage as a means of keeping track of queued, running, hung, canceled, errored and completed tasks.

> note - The required database connectors must be installed in your project, or globally. This is due to the fact that this library tries to use as few dependencies as possible and most people use this with an existing database and don't want to try to run two connection versions at the same time.

### How it works
Currently it's implementing a FCFS type algorithm to ensure jobs get done in the order they are registered. The reading / updating of all jobs is done with locking and or transactions. This allows for scalability as you may deploy this application in a cluster, and each machine will never have a dirty read / write and try to process the same job simultaniously as another node in the cluster. 

There is a priority override to the FCSC (first come first serve sorting). Priorities are read from highest number to lowest, then by runtime date stamp.

# Installation

```
$ npm -i node-scheduler
```

# Usage
Just for your clarity here are a few key words and what they refer to:
* job - The record that's persisted and defines what function to run (by id) and when to run it
* task - Your actual function to run that accepts a job in the function parameters
* scheduler - This manages the cron and when to look up for jobs to run / reset etc
* queue manager - This manages the queue of jobs and is kept in check by the scheduler

```ts
import { Scheduler, IJob, ISchedulerOptions } from 'node-scheduler';

// This creates the Scheduler instance and gives the cron times of the run and reset jobs
const options: ISchedulerOptions = {
    jobRunTime: '0 * * * * *',
    resetJobTime: '0 * * * * *'
}
const scheduler: Scheduler = Scheduler(options);

// this assigns a job (taskID, callback)
scheduler.registerTask(0, doMyTask);

function doMyTask(job: IJob) {
    // get some initial values from the jobs initial data
    const email: string = job.initial_data.email;
    // set the job's current progress to 10
    job.progressUpdate(10); 
    const sent = await MyCustomClass.sendEmail(email);
    if(sent != null) {
        job.updateData('completed', true);
        job.complete();
    } else {
        job.errored('could not send email');
    }
} 
```

### Envirnoment Variables
This project can be initalised with an options object, or with envirnoment variables - or a mix of both.

| Variable Name  | Description |
| ------------- | ------------- |
| NS_RUN_CRON  | What cron interval to run the jobs |
| NS_RERUN_CRON Cell  | What cron interval to check for jobs to reset  |

### Dependencies

This is a list of dependencies required to run the package in a production envirnoment.

* [cron@1.7.2] - [node-cron](https://www.npmjs.com/package/cron)

### Events
Scheduler Events

| Event | Description |
| ------ | ------ |
| schedulerRunning | Triggers when the cron triggers the main scheduler to run |
| schedulerError | Triggers when there is an error with running the scheduler (not the job itself) |
| schedulerResetRunning | Triggers when the cron triggers the scheduler to reset any jobs (resetting) |
| schedulerResetError | Triggers when there is an error when trying to reset any jobs |

Job Events

| Event | Description |
| ------ | ------ |
| jobCompleted | Triggers when a job is listed as completed |
| jobProgressUpdate | Triggers when a job has a progress update and needs to persist the data |
| jobErrored | Triggers when a job is errored |

### Development

Want to contribute? Great!

### Todos

 - Job delay
 - Add a priority to override time order (fcfs)
 - Add job cancel function & event
 - Implement Redis
 - Implement MongoDB
 - Implement Postgres
 - Add a S3 / file upload logs or winston type logger
 - Lock table in MySQL so I can remove mysql needing to use multi-statement (security improvement)

License
----

MIT

