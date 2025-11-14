const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Hash a password for admin user
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
};

// Update admin user with properly hashed password
const updateAdminPassword = async () => {
  try {
    // Hash the admin password
    const adminPassword = 'Admin123!';
    const hashedPassword = await hashPassword(adminPassword);
    
    // Update the admin user in database
    const [result] = await pool.execute(`
      UPDATE users 
      SET password_hash = ? 
      WHERE email = 'ivanlouiemalicsi@gmail.com'
    `, [hashedPassword]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully');
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Verify login works
    console.log('\n--- Verifying login ---');
    const isValid = await bcrypt.compare(adminPassword, hashedPassword);
    console.log(`Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    process.exit();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  console.log('🔐 Updating admin password...\n');
  updateAdminPassword();
}

module.exports = { hashPassword };