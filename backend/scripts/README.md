# MySQL Users Export Tools

This directory contains tools to export MySQL users to JSON format.

## 🚀 Quick Start

### Method 1: Using npm scripts (Recommended)
```bash
# Navigate to backend directory
cd backend

# Export only application users
npm run export-users

# Export all users (including MySQL system users)
npm run export-all-users
```

### Method 2: Using PowerShell script (Windows)
```powershell
# Navigate to backend directory
cd backend

# Run the interactive export tool
.\scripts\export-users.ps1
```

### Method 3: Direct execution
```bash
# Navigate to backend directory
cd backend

# Run specific script
node scripts/exportUsersToJson.js
node scripts/exportAllUsersToJson.js
```

## 📁 Output

All exports are saved to the `backend/exports/` directory with filenames like:
- `users_export_2025-10-10.json` (application users only)
- `complete_users_export_2025-10-10.json` (all users)

## 🔧 Configuration

1. Copy `.env.export.example` to `.env.export`
2. Modify the database connection settings:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_DATABASE=blue_eagles_db
   ```

## 📊 Export Types

### Application Users Export (`exportUsersToJson.js`)
Exports users from your application's `users` table including:
- User ID, names, email
- Roles and permissions
- Account status (blocked/active)
- Creation and update timestamps

### Complete Users Export (`exportAllUsersToJson.js`)
Exports comprehensive user data including:
- **Application Users**: From your app's users table
- **MySQL System Users**: From mysql.user table
- **User Privileges**: From information_schema.TABLE_PRIVILEGES

## 📋 Sample JSON Output

### Application Users Export
```json
{
  "exportDate": "2025-10-10T10:30:00.000Z",
  "totalUsers": 25,
  "users": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "admin",
      "isBlocked": false,
      "created_at": "2025-01-15T08:00:00.000Z"
    }
  ]
}
```

### Complete Export
```json
{
  "exportDate": "2025-10-10T10:30:00.000Z",
  "databaseName": "blue_eagles_db",
  "exports": {
    "applicationUsers": {
      "count": 25,
      "data": [...]
    },
    "mysqlSystemUsers": {
      "count": 5,
      "data": [...]
    },
    "userPrivileges": {
      "count": 45,
      "data": [...]
    }
  }
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Make sure MySQL server is running
   - Check your database credentials
   - Verify the database name exists

2. **Permission Denied**
   - For MySQL system users export, you need SELECT privilege on mysql.user table
   - Grant privileges: `GRANT SELECT ON mysql.user TO 'your_user'@'localhost';`

3. **Table Not Found**
   - Make sure your application's users table exists
   - Run your database setup scripts first

### Database Setup Check:
```sql
-- Check if users table exists
SHOW TABLES LIKE 'users';

-- Check users table structure
DESCRIBE users;

-- Count total users
SELECT COUNT(*) FROM users;
```

## 🔒 Security Notes

- The exported JSON files may contain sensitive information
- Store exports securely and limit access
- Consider excluding password hashes from exports
- Use environment variables for database credentials

## 📝 Usage Examples

### Viewing Export Results
```bash
# View the latest export
cat exports/users_export_2025-10-10.json | jq '.'

# Count users by role
cat exports/users_export_2025-10-10.json | jq '.users | group_by(.role) | map({role: .[0].role, count: length})'

# Find blocked users
cat exports/users_export_2025-10-10.json | jq '.users[] | select(.isBlocked == true)'
```

### Automated Exports
You can schedule these exports using cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Daily export at 2 AM
0 2 * * * cd /path/to/backend && npm run export-users
```