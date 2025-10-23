-- Bookings table for customer service bookings

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
	FOREIGN KEY (approved_by) REFERENCES users(id),
	INDEX idx_bookings_user (user_id),
	INDEX idx_bookings_status (status),
	INDEX idx_bookings_date (date),
	INDEX idx_bookings_email (email)
);

SELECT 'Bookings table created successfully!' AS message;
