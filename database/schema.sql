-- CampusBite authentication schema
-- Run inside the `campusbite` database (phpMyAdmin SQL tab, or:
--   C:\xampp\mysql\bin\mysql.exe -u root campusbite < database/schema.sql)

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo admin account (password: Admin@123) so the admin dashboard stays reachable.
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
  ('CampusBite Admin', 'admin@campus.edu', '$2y$10$TJURVdjGxTmwP3pa3YrJW.cX7G1mLx4M1k8UzF6wyC.AEGMjcAUFi', 'admin');