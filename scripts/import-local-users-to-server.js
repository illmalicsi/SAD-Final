#!/usr/bin/env node
// Simple import utility: reads a JSON file of local users and POSTs them to the server register endpoint.
// Usage: node scripts/import-local-users-to-server.js [path/to/file.json] [--dry-run] [--url=http://localhost:5000/api]

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const fileArg = argv.find(a => !a.startsWith('--')) || 'exports/complete_users_export_2025-10-10.json';
const dryRun = argv.includes('--dry-run');
const urlArg = argv.find(a => a.startsWith('--url='));
const API_BASE = urlArg ? urlArg.split('=')[1] : (process.env.API_URL || 'http://localhost:5000/api');

async function main() {
  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let users;
  try {
    users = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse JSON:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(users)) {
    console.error('Expected an array of users in the JSON file');
    process.exit(1);
  }

  console.log(`Found ${users.length} users in ${fileArg}`);
  if (dryRun) {
    console.log('Dry run - the script will not POST to the server. Use without --dry-run to perform import.');
  }

  for (const u of users) {
    // Map fields to what the server expects: firstName, lastName, email, password (use provided or fallback)
    const payload = {
      firstName: u.firstName || u.first_name || u.first || u.name?.split?.(' ')?.[0] || 'First',
      lastName: u.lastName || u.last_name || u.last || u.name?.split?.(' ')?.slice(1).join(' ') || 'Last',
      email: u.email || u.emailAddress || u.username,
      password: u.password || u.password_hash || (u.email ? `pw-${u.email}` : `pw-${Date.now()}`),
      birthday: u.birthday || u.dob || null,
      phone: u.phone || u.contact || null,
      address: u.address || null,
      instrument: u.instrument || null
    };

    // Skip users without email
    if (!payload.email) {
      console.warn('Skipping user missing email:', JSON.stringify(u).slice(0, 120));
      continue;
    }

    if (dryRun) {
      console.log('DRY:', payload.email, payload.firstName, payload.lastName);
      continue;
    }

    try {
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.warn(`Failed to import ${payload.email}:`, data && data.message ? data.message : resp.status);
      } else {
        console.log(`Imported ${payload.email} -> server id=${data?.user?.id || 'unknown'}`);
      }
    } catch (err) {
      console.error('Network/import error for', payload.email, err.message || err);
    }
  }

  console.log('Import finished');
}

main().catch(err => {
  console.error('Unhandled error', err);
  process.exit(1);
});
