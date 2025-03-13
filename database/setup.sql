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
    video_path VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
    FOREIGN KEY (video_id) REFERENCES subtitles(video_id)
    FOREIGN KEY (video_name) REFERENCES subtitles(video_name)
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

CREATE TABLE user_videos (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    video_path VARCHAR(255) NOT NULL,
    video_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (video_id) REFERENCES videos(id)
)

CREATE TABLE user_images (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)

--We need to load the data into the database
--LOAD DATA INFILE 'C:\Users\taris\Downloads\how2sign_train.csv' INTO TABLE gestureai.subtitles FIELDS TERMINATED BY '    ' LINES TERMINATED BY '\n' IGNORE 1 LINES;