-- Run in the existing campusbite database. This creates only the orders table.
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(30) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  pickup_location VARCHAR(100) NOT NULL,
  pickup_time VARCHAR(50) NOT NULL,
  special_instructions TEXT NULL,
  payment_method VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
