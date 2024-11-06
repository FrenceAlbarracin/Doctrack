const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserLoginModel');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: email }
            ]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await user.comparePassword(password);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.role === 'officer' && user.status === 'pending') {
            return res.status(403).json({ 
                error: 'Your account is pending. Please contact the admin to approve your account.'
            });
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role,
                status: user.status 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
