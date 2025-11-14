const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const debugLogin = async () => {
  try {
    console.log('🔍 Debugging login issue...\n');
    
    // 1. Check if database and tables exist
    console.log('1. Checking database structure...');
    
    try {
      const [tables] = await pool.execute('SHOW TABLES');
      console.log('   Tables in database:', tables.map(t => Object.values(t)[0]));
      
      if (tables.length === 0) {
        console.log('   ❌ No tables found! Please run the SQL setup script first.');
        return;
      }
    } catch (error) {
      console.log('   ❌ Error accessing database:', error.message);
      return;
    }
    
    // 2. Check if roles exist
    console.log('\n2. Checking roles...');
    try {
      const [roles] = await pool.execute('SELECT * FROM roles');
      console.log('   Roles found:', roles);
    } catch (error) {
      console.log('   ❌ Error checking roles:', error.message);
    }
    
    // 3. Check if users exist
    console.log('\n3. Checking users...');
    try {
      const [users] = await pool.execute(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, 
               u.is_active, u.is_blocked, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
      `);
      
      if (users.length === 0) {
        console.log('   ❌ No users found in database!');
      } else {
        console.log('   Users found:');
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.role_name}) - Active: ${user.is_active}, Blocked: ${user.is_blocked}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error checking users:', error.message);
    }
    
    // 4. Test password hashing
    console.log('\n4. Testing password hashing...');
    const testPassword = 'Admin123!';
    const hash = await bcrypt.hash(testPassword, 10);
    console.log('   New hash for "Admin123!":', hash);
    
    const isValid = await bcrypt.compare(testPassword, hash);
    console.log('   Hash verification test:', isValid ? '✅ Pass' : '❌ Fail');
    
    // 5. Try to find the specific user
    console.log('\n5. Looking for admin user...');
    try {
      const [adminUser] = await pool.execute(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, 
               u.is_active, u.is_blocked, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = ?
      `, ['ivanlouiemalicsi@gmail.com']);
      
      if (adminUser.length === 0) {
        console.log('   ❌ Admin user not found!');
        console.log('   🔧 Creating admin user...');
        
        // Create admin user with proper hash
        const newHash = await bcrypt.hash('Admin123!', 10);
        await pool.execute(`
          INSERT INTO users (first_name, last_name, email, password_hash, role_id)
          VALUES ('Ivan Louie', 'Malicsi', 'ivanlouiemalicsi@gmail.com', ?, 1)
        `, [newHash]);
        
        console.log('   ✅ Admin user created successfully!');
      } else {
        const user = adminUser[0];
        console.log('   ✅ Admin user found:', {
          email: user.email,
          role: user.role_name,
          active: user.is_active,
          blocked: user.is_blocked
        });
        
        // Test password verification
        const passwordMatch = await bcrypt.compare('Admin123!', user.password_hash);
        console.log('   Password verification:', passwordMatch ? '✅ Match' : '❌ No match');
        
        if (!passwordMatch) {
          console.log('   🔧 Updating password hash...');
          const newHash = await bcrypt.hash('Admin123!', 10);
          await pool.execute(`
            UPDATE users SET password_hash = ? WHERE email = ?
          `, [newHash, 'ivanlouiemalicsi@gmail.com']);
          console.log('   ✅ Password updated!');
        }
      }
    } catch (error) {
      console.log('   ❌ Error with admin user:', error.message);
    }
    
    console.log('\n🎉 Debug complete! Try logging in again.');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  } finally {
    process.exit();
  }
};

// Run the debug script
debugLogin();