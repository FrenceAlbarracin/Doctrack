const express = require('express');
const router = express.Router();
const User = require('../models/UserLoginModel');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, contactNumber } = req.body;

        // Validate email format
        if (!email.endsWith('@student.buksu.edu.ph')) {
            return res.status(400).json({
                error: 'Please use a valid BukSU student email address'
            });
        }

        // Validate contact number
        if (!/^[0-9]{11}$/.test(contactNumber)) {
            return res.status(400).json({
                error: 'Please enter a valid 11-digit contact number'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            contactNumber,
            role: 'student',
            status: 'pending'
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please wait for admin approval.',
            user: {
                username,
                email,
                contactNumber,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
});

module.exports = router;
