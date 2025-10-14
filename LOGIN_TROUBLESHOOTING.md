# 🔍 LOGIN "FAILED TO FETCH" - TROUBLESHOOTING GUIDE

## ✅ SERVERS ARE RUNNING

- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:3000

---

## 🚀 QUICK FIX - TEST THESE STEPS

### Step 1: Verify Backend is Accessible

**Open a new browser tab and go to:**
```
http://localhost:5000/api/health
```

**Should see:**
```json
{
  "status": "OK",
  "message": "Blue Eagles Music Band API is running",
  "timestamp": "2025-01-15T..."
}
```

✅ If you see this → Backend is working  
❌ If error → Backend is not running

---

### Step 2: Test Login Endpoint Directly

**Open browser console (F12) and paste:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'ivanlouiemalicsi@gmail.com',
    password: 'Admin123!'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Login response:', data))
.catch(err => console.error('❌ Login error:', err));
```

**Should see:**
```
✅ Login response: {success: true, token: '...', user: {...}}
```

---

### Step 3: Check for Common Issues

#### Issue 1: Backend Not Running
**Check terminal for:**
```
✅ Database connected successfully
🚀 Server running on port 5000
```

**If not running, restart:**
```powershell
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
npm start
```

---

#### Issue 2: Port 5000 Already in Use

**Check what's using port 5000:**
```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object State, OwningProcess
```

**If something else is using it:**
```powershell
# Kill the process
Stop-Process -Id <ProcessID> -Force
# Then restart backend
cd backend
npm start
```

---

#### Issue 3: Firewall Blocking Connection

**Temporarily disable firewall:**
- Windows Security → Firewall & network protection
- Turn off for Private networks
- Try login again

---

#### Issue 4: Browser Cache/CORS

**Clear browser data:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh: `Ctrl + F5`

**OR clear in console:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

### Step 4: Check Console for Errors

**Open browser console (F12) when trying to login:**

**Look for:**
```
❌ Failed to fetch
❌ CORS error
❌ Network request failed
❌ ERR_CONNECTION_REFUSED
```

**Common errors and fixes:**

**1. "Failed to fetch"**
- Backend is not running
- Wrong URL (should be http://localhost:5000)
- Firewall blocking

**2. "CORS policy error"**
- Backend CORS not configured (already fixed)
- Need to restart backend

**3. "ERR_CONNECTION_REFUSED"**
- Port 5000 not accessible
- Backend crashed
- Check backend terminal for errors

---

## 🔧 DETAILED DEBUGGING

### Check Backend Logs:

When you try to login, backend should show:
```
POST /api/auth/login
Looking up user: ivanlouiemalicsi@gmail.com
Login successful: ivanlouiemalicsi@gmail.com
```

**If no logs appear:**
- Backend not receiving request
- Check URL is correct
- Check CORS

**If error appears:**
- Check error message
- Database connection issue?
- Invalid credentials?

---

### Check Frontend Network Tab:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for request to `login`

**Click on the request:**

**Status:**
- ✅ 200 OK → Success
- ❌ 401 Unauthorized → Wrong password
- ❌ 404 Not Found → Wrong URL
- ❌ 500 Error → Backend error
- ❌ (failed) → Can't reach backend

**Response:**
- Should see JSON with token and user

**Headers:**
- Request URL should be: `http://localhost:5000/api/auth/login`
- Method: POST
- Content-Type: application/json

---

## 🎯 MOST LIKELY CAUSES

### 1. Backend Stopped (90% chance)

**Fix:**
```powershell
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
npm start
```

**Verify it's running:**
```
http://localhost:5000/api/health
```

---

### 2. Wrong Credentials

**Admin account:**
- Email: `ivanlouiemalicsi@gmail.com`
- Password: `Admin123!`

**Case sensitive!**

---

### 3. Database Connection Failed

**Check backend terminal for:**
```
❌ Database connection failed
```

**Fix:**
- Check MySQL is running
- Check database credentials in backend/.env
- Verify database `dbemb` exists

---

## 📝 QUICK CHECKLIST

Before trying to login:

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Frontend terminal shows "webpack compiled successfully"
- [ ] Can access http://localhost:5000/api/health
- [ ] Can access http://localhost:3000
- [ ] Cleared browser cache/localStorage
- [ ] Using correct credentials

---

## 🆘 IF STILL NOT WORKING

**Restart everything:**

```powershell
# 1. Kill all Node processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 2. Start backend
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\backend"
npm start

# Wait 3 seconds

# 3. Start frontend (in NEW terminal)
cd "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main\dbemb"
npm start
```

**Then try:**
1. Go to http://localhost:3000
2. Clear localStorage: `localStorage.clear()`
3. Refresh: `Ctrl + F5`
4. Try login again

---

## 📞 ERROR MESSAGES & SOLUTIONS

| Error | Solution |
|-------|----------|
| "Failed to fetch" | Backend not running → restart backend |
| "Network request failed" | Check port 5000 is open |
| "CORS policy" | Restart backend |
| "Invalid credentials" | Check email/password |
| "Database connection failed" | Start MySQL, check .env |
| Nothing happens | Check console for errors |

---

**Status:** Both servers are RUNNING  
**Most Likely Issue:** Browser cache or backend stopped  
**Quick Fix:** Restart backend, clear cache, try again
