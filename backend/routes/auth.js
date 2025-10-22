const express = require('express');
const authService = require('../services/authService');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'identityProof-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Register route
router.post('/register', upload.single('identityProof'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthday, phone, instrument, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email,
      password
    };

    // Add optional fields if provided
    if (birthday) userData.birthday = birthday;
    if (phone) userData.phone = phone;
    if (instrument) userData.instrument = instrument;
    if (address) userData.address = address;
    if (req.file) userData.identityProof = req.file.path;

    const user = await authService.register(userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Google OAuth login/register
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Missing Google ID token' });
    }

    const result = await authService.googleLoginOrRegister(idToken);

    res.json({
      success: true,
      message: 'Google authentication successful',
      ...result
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ success: false, message: error.message || 'Google authentication failed' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await authService.getUserById(decoded.userId);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;