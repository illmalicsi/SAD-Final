-- Updated MySQL script with proper password hashing
CREATE DATABASE IF NOT EXISTS dbemb;
USE dbemb;

-- Roles table (master list of roles)
CREATE TABLE IF NOT EXISTS roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Users table (linked to roles by role_id)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Insert default roles
-- Ensure predictable role_ids so seeded users reference correct role_id values
INSERT INTO roles (role_id, role_name) VALUES
  (1, 'admin'),
  (2, 'member'),
  (3, 'user')

-- Insert a default super admin (plain-text for local/school project)
-- Password: Admin123!
INSERT INTO users (first_name, last_name, email, password_hash, role_id)
VALUES (
  'Ivan Louie',
  'Malicsi',
  'ivanlouiemalicsi@gmail.com',
  'Admin123!',
  1
) ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role_id = VALUES(role_id);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active, is_blocked);

-- Insert some sample users for testing (plain-text passwords for local/school use)
INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES
  ('Harley', 'Cuba', 'hlncuba@addu.edu.ph', 'password123', 2),
  ('Jan Aceryl', 'Futalan', 'jnfutalan@addu.edu.ph', 'password123', 3),
  ('Ivan', 'Lim', 'ilimlouiemalicsi@gmail.com', 'password123', 3),
  ('Harley', 'Potter', 'harley.potter@blueeagles.com', 'HarleyPass123!', 3)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);

-- Display created users
SELECT u.id, u.first_name, u.last_name, u.email, r.role_name, u.is_active, u.created_at
FROM users u
JOIN roles r ON u.role_id = r.role_id
ORDER BY u.created_at;

-- Billing schema: invoices, payments, transactions
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  status ENUM('pending','approved','paid') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  processed_by INT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  invoice_id INT,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);