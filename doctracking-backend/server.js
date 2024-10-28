const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
});

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Generate verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Add this new route
app.get('/', (req, res) => {
  console.log('Received request for root route');
  res.send('Hello from the server!');
});

// Login route
app.post('/api/login', (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    console.log('User found:', user);
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!isMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('Login successful for user:', email);
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          email: user.email,
          username: user.username 
        } 
      });
    });
  });
});

// Signup route
app.post('/api/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  const { email, username, contactNumber, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user
    const query = 'INSERT INTO users (email, username, phone_number, password) VALUES (?, ?, ?, ?)';
    db.query(query, [email, username, contactNumber, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('User created successfully');
      res.status(201).json({ message: 'User created successfully' });
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Google OAuth login/signup route
app.post('/api/login/google', async (req, res) => {
  console.log('Google auth request received:', req.body);
  const { sub: google_id, email, given_name, family_name, picture, name } = req.body;

  try {
    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = ? OR google_id = ?';
    db.query(query, [email, google_id], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // If user exists, log them in
      if (results.length > 0) {
        const user = results[0];
        // Update user's Google information
        const updateQuery = `
          UPDATE users 
          SET google_id = ?,
              given_name = ?,
              family_name = ?,
              profile_picture = ?
          WHERE id = ?`;
        
        db.query(updateQuery, [google_id, given_name, family_name, picture, user.id]);

        return res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            given_name: user.given_name,
            family_name: user.family_name,
            profile_picture: user.profile_picture
          }
        });
      }

      // If user doesn't exist, create new account
      const username = email.split('@')[0]; // Generate username from email
      const insertQuery = `
        INSERT INTO users 
        (email, username, google_id, given_name, family_name, profile_picture, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      
      db.query(insertQuery, [email, username, google_id, given_name, family_name, picture], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Return the newly created user
        const newUser = {
          id: result.insertId,
          email: email,
          username: username,
          given_name: given_name,
          family_name: family_name,
          profile_picture: picture
        };

        return res.status(201).json({
          message: 'Account created and logged in successfully',
          user: newUser
        });
      });
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset route
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Password reset requested for email:', email);
  
  try {
    // Check if user exists in database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // If no user found with this email
      if (results.length === 0) {
        console.log('No user found with email:', email);
        return res.status(404).json({ 
          error: 'No account found with this email address. Please check your email or sign up.' 
        });
      }

      // User exists, proceed with verification code
      const verificationCode = generateVerificationCode();
      
      // Store the code with the email (expires in 10 minutes)
      verificationCodes.set(email, {
        code: verificationCode,
        expiresAt: Date.now() + 600000 // 10 minutes
      });

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Verification Code',
        html: `
          <h1>Password Reset Request</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Verification code sent to:', email);
        res.json({ 
          message: 'Verification code sent to your email',
          success: true 
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(500).json({ 
          error: 'Failed to send verification code. Please try again.' 
        });
      }
    });
  } catch (error) {
    console.error('Error in forgot password route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify code and reset password route
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Clear verification code
      verificationCodes.delete(email);
      res.json({ message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// Start server (make sure this is only declared once)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
