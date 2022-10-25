-- prepares a MySQL server for the project

CREATE DATABASE IF NOT EXISTS EBW_db;
CREATE USER IF NOT EXISTS 'EBW_dev'@'%' IDENTIFIED WITH mysql_native_password BY 'EBW_dev_pwd';
GRANT ALL PRIVILEGES ON `EBW_db`.* TO 'EBW_dev'@'%';
GRANT SELECT ON `performance_schema`.* TO 'EBW_dev'@'%;
FLUSH PRIVILEGES;