-- Run once in the existing campusbite database using phpMyAdmin.
-- Adds the single Staff role while preserving existing student/admin accounts.
ALTER TABLE users
    MODIFY role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student';
