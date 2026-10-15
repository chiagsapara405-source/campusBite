-- Run in the existing campusbite database to store admin cafeteria settings.
CREATE TABLE IF NOT EXISTS cafeteria_settings (
  id TINYINT UNSIGNED NOT NULL,
  cafeteria_name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  operating_status ENUM('Open', 'Closed', 'Maintenance') NOT NULL DEFAULT 'Open',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cafeteria_settings (id, cafeteria_name, location, operating_status)
VALUES (1, 'CampusBite Cafeteria', 'Main Cafeteria / Food Court', 'Open')
ON DUPLICATE KEY UPDATE id = VALUES(id);
