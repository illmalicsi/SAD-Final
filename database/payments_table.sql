CREATE TABLE IF NOT EXISTS payments (
	payment_id INT AUTO_INCREMENT PRIMARY KEY,
	booking_id INT NOT NULL,
	amount DECIMAL(10,2) NOT NULL,
	payment_date DATETIME NOT NULL,
	payment_status VARCHAR(32) NOT NULL,
	FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);
