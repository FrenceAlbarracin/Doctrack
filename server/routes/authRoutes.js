const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UserLoginModel');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt details:', {
            email,
            providedPassword: password,
        });

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: email.toLowerCase() }
            ]
        });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            console.log('User account not active:', email);
            return res.status(403).json({ error: 'Account is not active. Please wait for admin approval.' });
        }

        const isValidPassword = await user.comparePassword(password);
        
        console.log('Password comparison details:', {
            isValid: isValidPassword,
            email: user.email,
            role: user.role,
            status: user.status
        });

        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
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
