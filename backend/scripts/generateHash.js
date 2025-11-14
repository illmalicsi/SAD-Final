const bcrypt = require('bcryptjs');

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node generateHash.js <plainPassword> [email]');
    process.exit(1);
  }

  const plain = args[0];
  const email = args[1];

  try {
    const hash = await bcrypt.hash(plain, 10);
    console.log('Plain password:', plain);
    console.log('Bcrypt hash  :', hash);
    if (email) {
      console.log('\nExample SQL to INSERT a new user (replace names/role_id as needed):');
      console.log("INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES ('First','Last','" + email + "','" + hash + "', 3);");
      console.log('\nExample SQL to UPDATE existing user password:');
      console.log("UPDATE users SET password_hash = '" + hash + "' WHERE email = '" + email + "';");
    } else {
      console.log('\nNo email provided. To get example SQL pass email as second argument.');
    }
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

main();
