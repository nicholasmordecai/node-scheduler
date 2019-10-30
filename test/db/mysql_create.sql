DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
    id int(11) NOT NULL AUTO_INCREMENT,
    job int(2) NOT NULL,
    initiator varchar(45) NOT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at datetime DEFAULT NULL,
    last_run_at datetime DEFAULT NULL,
    initial_data json NOT NULL,
    latest_data json DEFAULT NULL,
    status int(1) DEFAULT NULL,
    progress int(3) NOT NULL DEFAULT '0',
    previous_job_id int(11) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS sent;

CREATE TABLE sent (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    playerId int(11) NOT NULL,
    emailType int(11) NOT NULL,
    stamp timestamp NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id (id)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4;