CREATE DATABASE IF NOT EXISTS dbemb;
USE dbemb;


CREATE TABLE IF NOT EXISTS roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT DEFAULT 3,
  phone VARCHAR(20),
  birthday DATE,
  instrument VARCHAR(100),
  address TEXT,
  identity_proof VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO roles (role_id, role_name) VALUES
  (1, 'admin'),
  (2, 'member'),
  (3, 'user')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

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

-- Create indexes only if they don't already exist. MySQL doesn't support
-- CREATE INDEX IF NOT EXISTS in all environments, so use a small helper
-- procedure that checks INFORMATION_SCHEMA and runs ALTER TABLE when needed.
DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing(tbl VARCHAR(64), idx VARCHAR(64), stmt TEXT)
BEGIN
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx) = 0 THEN
    SET @s = stmt;
    PREPARE st FROM @s;
    EXECUTE st;
    DEALLOCATE PREPARE st;
  END IF;
END$$
DELIMITER ;

CALL add_index_if_missing('users','idx_users_role','ALTER TABLE users ADD INDEX idx_users_role (role_id)');
CALL add_index_if_missing('users','idx_users_active','ALTER TABLE users ADD INDEX idx_users_active (is_active, is_blocked)');
DROP PROCEDURE IF EXISTS add_index_if_missing;

INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES
  ('Harley', 'Cuba', 'hlncuba@addu.edu.ph', 'password123', 2),
  ('Jan Aceryl', 'Futalan', 'jnfutalan@addu.edu.ph', 'password123', 3),
  ('Ivan', 'Lim', 'ilimlouiemalicsi@gmail.com', 'password123', 3),
  ('Harley', 'Potter', 'harley.potter@blueeagles.com', 'HarleyPass123!', 3)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);


CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  status ENUM('pending','approved','paid','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','card','bank_transfer','online') DEFAULT 'cash',
  processed_by INT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  invoice_id INT,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('invoice','payment','refund','rental','borrowing') NOT NULL,
  status ENUM('pending','completed','failed','cancelled') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

DROP TABLE IF EXISTS instruments;
CREATE TABLE instruments (
  instrument_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category ENUM('percussion','wind','brass','woodwind','other') NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  condition_status ENUM('Excellent','Good','Fair','Poor') DEFAULT 'Good',
  availability_status ENUM('Available','Rented','Borrowed','Maintenance','Unavailable') DEFAULT 'Available',
  quantity INT DEFAULT 1,
  price_per_day DECIMAL(10,2) DEFAULT NULL,
  location VARCHAR(255),
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_instruments_name (name)
);

INSERT INTO instruments (name, category, subcategory, brand, condition_status, availability_status, quantity, price_per_day, location) VALUES
  ('Yamaha Black Snare Drum #01', 'percussion', 'Snare Drums', 'Yamaha', 'Good', 'Available', 1, 1000.00, 'Shrine Hills, Matina'),
  ('Yamaha Black Snare Drum #02', 'percussion', 'Snare Drums', 'Yamaha', 'Good', 'Available', 1, 1000.00, 'Shrine Hills, Matina'),
  ('Yamaha Black Snare Drum (Evans Drum Head) #03', 'percussion', 'Snare Drums', 'Yamaha', 'Excellent', 'Available', 2, 1000.00, 'Shrine Hills, Matina'),
  ('Pearl Snare Drum Color White #01', 'percussion', 'Snare Drums', 'Pearl', 'Good', 'Available', 1, 1000.00, 'Shrine Hills, Matina'),
  ('Pearl Snare Drum Color Dirt White #02', 'percussion', 'Snare Drums', 'Pearl', 'Fair', 'Available', 2, 1000.00, 'Shrine Hills, Matina'),
  ('Lazer Bass Drum #01', 'percussion', 'Bass Drums', 'Lazer', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Bass Drum #02', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Bass Drum #03', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Bass Drum #04', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('Fernando Bass Drum #02', 'percussion', 'Bass Drums', 'Fernando', 'Good', 'Available', 1, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Percussion Black Tenor Drums', 'percussion', 'Tenor Drums', 'E-lance', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('Century Percussion White Tenor Drums', 'percussion', 'Tenor Drums', 'Century', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('Zildjian Marching Cymbals', 'percussion', 'Cymbals', 'Zildjian', 'Excellent', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Percussion Marching Glockenspiel #01', 'percussion', 'Other Percussion', 'E-lance', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('E-lance Percussion Marching Glockenspiel #02', 'percussion', 'Other Percussion', 'E-lance', 'Good', 'Available', 15, 500.00, 'Storage A'),
  ('Yamaha Clarinet', 'woodwind', 'Woodwinds', 'Yamaha', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina'),
  ('Fernando Tuba', 'brass', 'Brass', 'Fernando', 'Good', 'Available', 2, 500.00, 'Shrine Hills, Matina');



CREATE TABLE IF NOT EXISTS borrow_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  instrument_id INT NOT NULL,
  instrument_name VARCHAR(255) NOT NULL,
  instrument_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  notes TEXT,
  status ENUM('pending','approved','rejected','returned') DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  returned_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rent_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  instrument_id INT NOT NULL,
  instrument_name VARCHAR(255) NOT NULL,
  instrument_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  notes TEXT,
  rental_fee DECIMAL(10,2),
  status ENUM('pending','approved','rejected','paid','returned') DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  paid_at TIMESTAMP NULL,
  returned_at TIMESTAMP NULL,
  invoice_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);


-- Add other indexes using the same helper approach to avoid duplicate-key errors
DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing(tbl VARCHAR(64), idx VARCHAR(64), stmt TEXT)
BEGIN
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx) = 0 THEN
    SET @s = stmt;
    PREPARE st FROM @s;
    EXECUTE st;
    DEALLOCATE PREPARE st;
  END IF;
END$$
DELIMITER ;

CALL add_index_if_missing('borrow_requests','idx_borrow_requests_user','ALTER TABLE borrow_requests ADD INDEX idx_borrow_requests_user (user_id)');
CALL add_index_if_missing('borrow_requests','idx_borrow_requests_status','ALTER TABLE borrow_requests ADD INDEX idx_borrow_requests_status (status)');
CALL add_index_if_missing('rent_requests','idx_rent_requests_user','ALTER TABLE rent_requests ADD INDEX idx_rent_requests_user (user_id)');
CALL add_index_if_missing('rent_requests','idx_rent_requests_status','ALTER TABLE rent_requests ADD INDEX idx_rent_requests_status (status)');
CALL add_index_if_missing('instruments','idx_instruments_status','ALTER TABLE instruments ADD INDEX idx_instruments_status (availability_status)');
CALL add_index_if_missing('instruments','idx_instruments_category','ALTER TABLE instruments ADD INDEX idx_instruments_category (category)');

-- Drop helper if present
DROP PROCEDURE IF EXISTS add_index_if_missing;


CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_value DECIMAL(10,2),
  status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Booking indexes
DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing(tbl VARCHAR(64), idx VARCHAR(64), stmt TEXT)
BEGIN
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx) = 0 THEN
    SET @s = stmt;
    PREPARE st FROM @s;
    EXECUTE st;
    DEALLOCATE PREPARE st;
  END IF;
END$$
DELIMITER ;

CALL add_index_if_missing('bookings','idx_bookings_user','ALTER TABLE bookings ADD INDEX idx_bookings_user (user_id)');
CALL add_index_if_missing('bookings','idx_bookings_status','ALTER TABLE bookings ADD INDEX idx_bookings_status (status)');
CALL add_index_if_missing('bookings','idx_bookings_date','ALTER TABLE bookings ADD INDEX idx_bookings_date (date)');
CALL add_index_if_missing('bookings','idx_bookings_email','ALTER TABLE bookings ADD INDEX idx_bookings_email (email)');
DROP PROCEDURE IF EXISTS add_index_if_missing;

CREATE TABLE IF NOT EXISTS booking_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME NOT NULL,
  payment_status VARCHAR(32) NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);


INSERT INTO invoices (user_id, amount, description, status, approved_by) VALUES
  (3, 500.00, 'Band performance at wedding ceremony', 'approved', 1),
  (4, 750.00, 'Instrument rental for school parade', 'pending', NULL),
  (3, 1200.00, 'Music arrangement and consultation', 'paid', 1),
  (4, 350.00, 'Workshop participation fee', 'pending', NULL)
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO payments (invoice_id, amount_paid, payment_method, processed_by, notes) VALUES
  (1, 500.00, 'cash', 1, 'Payment received in full'),
  (3, 1200.00, 'bank_transfer', 1, 'Bank transfer confirmed')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

INSERT INTO transactions (user_id, invoice_id, amount, transaction_type, status, description) VALUES
  (3, 1, 500.00, 'payment', 'completed', 'Wedding performance payment'),
  (4, 2, 750.00, 'invoice', 'pending', 'Instrument rental invoice'),
  (3, 3, 1200.00, 'payment', 'completed', 'Music arrangement payment'),
  (4, 4, 350.00, 'invoice', 'pending', 'Workshop fee invoice')
ON DUPLICATE KEY UPDATE description = VALUES(description);


INSERT INTO borrow_requests (user_id, instrument_id, instrument_name, instrument_type, quantity, start_date, end_date, purpose, status, approved_by) VALUES
  (2, 1, 'Yamaha Black Snare Drum #01', 'percussion', 1, '2025-10-20', '2025-10-25', 'Practice session for upcoming competition', 'approved', 1),
  (2, 6, 'Lazer Bass Drum #01', 'percussion', 1, '2025-10-15', '2025-10-18', 'Band rehearsal', 'pending', NULL)
ON DUPLICATE KEY UPDATE purpose = VALUES(purpose);

INSERT INTO rent_requests (user_id, instrument_id, instrument_name, instrument_type, quantity, start_date, end_date, purpose, rental_fee, status, invoice_id) VALUES
  (3, 13, 'Zildjian Marching Cymbals', 'percussion', 2, '2025-11-01', '2025-11-03', 'School parade event', 200.00, 'pending', NULL),
  (4, 16, 'Yamaha Clarinet', 'woodwind', 1, '2025-10-25', '2025-10-30', 'Solo performance at church', 150.00, 'approved', 2)
ON DUPLICATE KEY UPDATE purpose = VALUES(purpose);


SELECT 'Database setup complete!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_instruments FROM instruments;
SELECT COUNT(*) AS total_invoices FROM invoices;
SELECT COUNT(*) AS total_borrow_requests FROM borrow_requests;
SELECT COUNT(*) AS total_rent_requests FROM rent_requests;