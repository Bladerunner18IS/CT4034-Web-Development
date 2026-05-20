-- sqldump downgraded to MariaDb 5.5.68 for compatibility.

-- NOTE: this will FORCE all timestamps to NOW() on INSERT,
--       even if you submit a different value!

-- To set a custom timestamp (why tho),
-- use UPDATE after inserting.


SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8;
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS;
SET UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- ------------------------------------------------------
-- Table: users
-- ------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `name` varchar(150) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `type` enum('public','police','admin') NOT NULL DEFAULT 'public',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DELIMITER //
CREATE TRIGGER trg_users_set_timestamp
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    SET NEW.created_at = NOW();
END//
DELIMITER ;

-- ------------------------------------------------------
-- Table: bikes
-- ------------------------------------------------------

DROP TABLE IF EXISTS `bikes`;

CREATE TABLE `bikes` (
  `bike_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `manufacturer_part_number` varchar(150) NOT NULL,
  `brand` varchar(150) NOT NULL,
  `model` varchar(150) NOT NULL,
  `type` varchar(150) NOT NULL,
  `wheel_size` varchar(30) NOT NULL,
  `colour` varchar(30) NOT NULL,
  `number_of_gears` tinyint unsigned DEFAULT NULL,
  `brake_type` varchar(150) NOT NULL,
  `suspension` varchar(30) DEFAULT NULL,
  `gender` enum('unisex','mens','womens') NOT NULL DEFAULT 'unisex',
  `age_group` enum('adult','youth','child') NOT NULL DEFAULT 'adult',
  `status` enum('active','stolen','recovered') NOT NULL DEFAULT 'active',
  `date_entered` date NOT NULL,
  `date_last_updated` date NOT NULL,
  PRIMARY KEY (`bike_id`),
  KEY `FK_userBike` (`user_id`),
  CONSTRAINT `FK_userBike` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DELIMITER //
CREATE TRIGGER trg_bikes_before_insert
BEFORE INSERT ON bikes
FOR EACH ROW
BEGIN
    SET NEW.date_entered = CURDATE();
    SET NEW.date_last_updated = CURDATE();
END//
DELIMITER ;

-- ------------------------------------------------------
-- Table: cases
-- ------------------------------------------------------

DROP TABLE IF EXISTS `cases`;

CREATE TABLE `cases` (
  `case_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` char(10) NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `bike_id` int(10) unsigned NOT NULL,
  `case_status` enum('open','closed') NOT NULL DEFAULT 'open',
  `date_opened` date NOT NULL,
  `date_closed` date DEFAULT NULL,
  PRIMARY KEY (`case_id`),
  UNIQUE KEY `UQ_caseBike` (`bike_id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `FK_userCase` (`user_id`),
  CONSTRAINT `FK_bikeCase` FOREIGN KEY (`bike_id`) REFERENCES `bikes` (`bike_id`),
  CONSTRAINT `FK_userCase` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ------------------------------------------------------
-- Table: images
-- ------------------------------------------------------

DROP TABLE IF EXISTS `images`;

CREATE TABLE `images` (
  `image_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bike_id` int(10) unsigned NOT NULL,
  `image_name` varchar(150) NOT NULL,
  `image_description` varchar(1024) DEFAULT NULL,
  `image_filename` varchar(1024) NOT NULL,
  `is_primary` tinyint(1) NOT NULL,
  PRIMARY KEY (`image_id`),
  KEY `FK_bikeImage` (`bike_id`),
  CONSTRAINT `FK_bikeImage` FOREIGN KEY (`bike_id`) REFERENCES `bikes` (`bike_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ------------------------------------------------------
-- Table: case_logs
-- ------------------------------------------------------

DROP TABLE IF EXISTS `case_logs`;

CREATE TABLE `case_logs` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `case_id` int(10) unsigned NOT NULL,
  `officer_id` int(10) unsigned NOT NULL,
  `submission_timestamp` datetime NOT NULL,
  `description` varchar(2048) NOT NULL,
  `new_status` enum('open','closed') NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `FK_caseLog` (`case_id`),
  KEY `FK_officerLog` (`officer_id`),
  CONSTRAINT `FK_caseLog` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_officerLog` FOREIGN KEY (`officer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- ------------------------------------------------------
-- Merged BEFORE INSERT trigger
-- ------------------------------------------------------

DELIMITER //
CREATE TRIGGER trg_case_logs_before_insert
BEFORE INSERT ON case_logs
FOR EACH ROW
BEGIN
    DECLARE officer_type ENUM('public','police','admin');

    -- Enforce police/admin only
    SELECT `type`
      INTO officer_type
      FROM users
     WHERE user_id = NEW.officer_id;

    IF officer_type NOT IN ('police','admin') THEN
        SET NEW.description = NULL; -- force NOT NULL error
    END IF;

    -- Always set timestamp
    SET NEW.submission_timestamp = NOW();
END//
DELIMITER ;

-- ------------------------------------------------------
-- Merged AFTER INSERT trigger
-- ------------------------------------------------------

DELIMITER //
CREATE TRIGGER trg_case_logs_after_insert
AFTER INSERT ON case_logs
FOR EACH ROW
BEGIN
    -- Update case status + date_closed
    UPDATE cases
       SET case_status = NEW.new_status,
           date_closed = CASE
                            WHEN NEW.new_status = 'closed' THEN CURDATE()
                            ELSE date_closed
                         END
     WHERE case_id = NEW.case_id;

    -- Update bike timestamp
    UPDATE bikes
       SET date_last_updated = CURDATE()
     WHERE bike_id = (
         SELECT bike_id
           FROM cases
          WHERE case_id = NEW.case_id
     );
END//
DELIMITER ;

-- ------------------------------------------------------
-- Create System account
-- ------------------------------------------------------

INSERT INTO users (email, name, password_hash, type)
VALUES (
    'admin@glos.ac.uk', 
    'System',
    '$2y$12$4.k0OuNdejZGW0FNflI8eOg6Et/ozC08VxEU0.q9..8VFwMtYTy5W',
    'admin'
);

-- ------------------------------------------------------
-- Restore session settings
-- ------------------------------------------------------

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET TIME_ZONE=@OLD_TIME_ZONE;
SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;
