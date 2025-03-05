DROP DATABASE IF EXISTS `gestureai`;
CREATE DATABASE gestureai;
USE gestureai;

CREATE TABLE subtitles (
    id INT NOT NULL AUTO_INCREMENT,
    video_id VARCHAR(255) NOT NULL,
    video_name VARCHAR(255) NOT NULL,
    sentence_id VARCHAR(255) NOT NULL,
    sentence_name VARCHAR(255) NOT NULL,
    start_time DOUBLE NOT NULL,
    end_time DOUBLE NOT NULL,
    sentence TEXT(1000) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE videos (
    id INT NOT NULL AUTO_INCREMENT,
    video_id VARCHAR(255) NOT NULL,
    video_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

LOAD DATA INFILE 'C:\Users\taris\Downloads\how2sign_train.csv' INTO TABLE subtitles FIELDS TERMINATED BY '    ' LINES TERMINATED BY '\n' IGNORE 1 LINES;