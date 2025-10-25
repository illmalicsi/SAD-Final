require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dbemb',
    port: Number(process.env.DB_PORT || 3306),
  };

  console.log('Connecting to MySQL with', { host: cfg.host, user: cfg.user, database: cfg.database, port: cfg.port });
  let conn;
  try {
    conn = await mysql.createConnection(cfg);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }

  try {
    // Create table if missing
    const createSql = `CREATE TABLE IF NOT EXISTS instruments (
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
);`;
    await conn.query(createSql);
    console.log('Created instruments table (if not existed)');

    // Seed rows (use the price-including list)
    const insertSql = `INSERT INTO instruments (name, category, subcategory, brand, condition_status, availability_status, quantity, price_per_day, location)
VALUES
  ('Yamaha Black Snare Drum #01', 'percussion', 'Snare Drums', 'Yamaha', 'Good', 'Available', 1, 1000.00, NULL),
  ('Yamaha Black Snare Drum #02', 'percussion', 'Snare Drums', 'Yamaha', 'Good', 'Available', 1, 1000.00, NULL),
  ('Yamaha Black Snare Drum (Evans Drum Head) #03', 'percussion', 'Snare Drums', 'Yamaha', 'Excellent', 'Available', 2, 1000.00, NULL),
  ('Pearl Snare Drum Color White #01', 'percussion', 'Snare Drums', 'Pearl', 'Good', 'Available', 1, 1000.00, NULL),
  ('Pearl Snare Drum Color Dirt White #02', 'percussion', 'Snare Drums', 'Pearl', 'Fair', 'Available', 2, 1000.00, NULL),
  ('Lazer Bass Drum #01', 'percussion', 'Bass Drums', 'Lazer', 'Good', 'Available', 2, 500.00, NULL),
  ('E-lance Bass Drum #02', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, NULL),
  ('E-lance Bass Drum #03', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, NULL),
  ('E-lance Bass Drum #04', 'percussion', 'Bass Drums', 'E-lance', 'Good', 'Available', 2, 500.00, NULL),
  ('Fernando Bass Drum #02', 'percussion', 'Bass Drums', 'Fernando', 'Good', 'Available', 1, 500.00, NULL),
  ('E-lance Percussion Black Tenor Drums', 'percussion', 'Tenor Drums', 'E-lance', 'Good', 'Available', 2, 500.00, NULL),
  ('Century Percussion White Tenor Drums', 'percussion', 'Tenor Drums', 'Century', 'Good', 'Available', 2, 500.00, NULL),
  ('Zildjian Marching Cymbals', 'percussion', 'Cymbals', 'Zildjian', 'Excellent', 'Available', 2, 500.00, NULL),
  ('E-lance Percussion Marching Glockenspiel #01', 'percussion', 'Other Percussion', 'E-lance', 'Good', 'Available', 2, 500.00, NULL),
  ('E-lance Percussion Marching Glockenspiel #02', 'percussion', 'Other Percussion', 'E-lance', 'Good', 'Available', 15, 500.00, NULL),
  ('Yamaha Clarinet', 'woodwind', 'Woodwinds', 'Yamaha', 'Good', 'Available', 2, 500.00, NULL),
  ('Fernando Tuba', 'brass', 'Brass', 'Fernando', 'Good', 'Available', 2, 500.00, NULL)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), availability_status = VALUES(availability_status), price_per_day = VALUES(price_per_day), location = VALUES(location);`;

    await conn.query(insertSql);
    console.log('Seeded instruments rows (inserted or updated)');

  } catch (err) {
    console.error('Error creating/seeding instruments:', err.message);
    process.exit(3);
  } finally {
    if (conn) await conn.end();
  }

  console.log('Done creating/seeding instruments table. Run scripts/check_db.js to verify.');
})();
