-- prepares a MySQL server for the project

CREATE DATABASE IF NOT EXISTS IGN_db;
CREATE USER IF NOT EXISTS 'IGN_dev'@'localhost' IDENTIFIED BY 'IGN_dev_pwd';
GRANT ALL PRIVILEGES ON `IGN_db`.* TO 'IGN_dev'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'IGN_dev'@'localhost';
FLUSH PRIVILEGES;