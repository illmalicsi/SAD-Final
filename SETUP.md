# Blue Eagles Music Band - Backend Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
1. Make sure MySQL is running on your system
2. Run the SQL script to create database and tables:
```sql
-- Run this in your MySQL client
source database/setup.sql;
-- OR copy and paste the contents from database/setup.sql
```

### 3. Environment Configuration
1. Copy the `.env` file in backend folder
2. Update the database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password  # ← Change this
DB_NAME=dbemb
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
```

### 4. Hash Admin Password (Important!)
The setup.sql includes a default hash, but you should create your own:
```bash
cd backend
node scripts/hashPassword.js
```

### 5. Start the Backend Server
```bash
npm run dev  # For development with nodemon
# OR
npm start    # For production
```

The server will start on http://localhost:5000

## 🔐 Default Login Credentials

After running the setup:
- **Admin**: `ivanlouiemalicsi@gmail.com` / `Admin123!`
- **Test Users**: Various users with password `password123`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/profile` - Get current user profile

### Health Check
- `GET /api/health` - Server status

## 🛠 Frontend Setup

### 1. Install Frontend Dependencies
```bash
cd ..  # Back to root folder
cd dbemb
npm install
```

### 2. Start React Development Server
```bash
npm start
```

The React app will start on http://localhost:3000

## 🔧 Testing the Setup

1. Start both backend (port 5000) and frontend (port 3000)
2. Go to http://localhost:3000
3. Try logging in with the admin credentials
4. Check browser console for any errors

## 🚨 Troubleshooting

### Database Connection Issues
- Make sure MySQL server is running
- Verify database credentials in `.env`
- Check if the `dbemb` database exists

### CORS Issues  
- Backend is configured for localhost:3000 and localhost:3001
- If using different ports, update CORS settings in `server.js`

### Password Issues
- Make sure you're using properly hashed passwords
- Run the `hashPassword.js` script to generate new hashes
- Never store plain text passwords in the database