/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.1-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: website
-- ------------------------------------------------------
-- Server version	11.8.1-MariaDB-4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `bikes`
--

DROP TABLE IF EXISTS `bikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bikes` (
  `bike_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `manufacturer_part_number` varchar(150) NOT NULL,
  `brand` varchar(150) NOT NULL,
  `model` varchar(150) NOT NULL,
  `type` varchar(150) NOT NULL,
  `wheel_size` varchar(30) NOT NULL,
  `colour` varchar(30) NOT NULL,
  `number_of_gears` tinyint(10) unsigned DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `case_logs`
--

DROP TABLE IF EXISTS `case_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_logs` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `case_id` int(10) unsigned NOT NULL,
  `officer_id` int(10) unsigned NOT NULL,
  `submission_timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `description` varchar(2048) NOT NULL,
  `new_status` enum('open','closed') NOT NULL,
  PRIMARY KEY (`log_id`),
  KEY `FK_caseLog` (`case_id`),
  KEY `FK_officerLog` (`officer_id`),
  CONSTRAINT `FK_caseLog` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_officerLog` FOREIGN KEY (`officer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_case_logs_police_only
BEFORE INSERT ON case_logs
FOR EACH ROW
BEGIN
    DECLARE officer_type ENUM('public','police','admin');

    SELECT `type`
      INTO officer_type
      FROM users
     WHERE user_id = NEW.officer_id;

    IF officer_type NOT IN ('police', 'admin') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only police officers or admins may create case logs.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_case_logs_update_case_status
AFTER INSERT ON case_logs
FOR EACH ROW
BEGIN
    UPDATE cases
       SET case_status = NEW.new_status,
           date_closed = CASE
                            WHEN NEW.new_status = 'closed' THEN CURRENT_DATE
                            ELSE date_closed
                         END
     WHERE case_id = NEW.case_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_case_logs_update_bike_timestamp
AFTER INSERT ON case_logs
FOR EACH ROW
BEGIN
    UPDATE bikes
       SET date_last_updated = CURRENT_DATE
     WHERE bike_id = (
         SELECT bike_id
           FROM cases
          WHERE case_id = NEW.case_id
     );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `case_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` char(10) NOT NULL DEFAULT substr(md5(rand()),1,10),
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `name` varchar(150) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `type` enum('public','police','admin') NOT NULL DEFAULT 'public',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-19 22:50:06
