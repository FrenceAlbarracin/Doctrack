// userController.js
const User = require('../models/UserLoginModel'); // Changed from UsersModel to UserLoginModel
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const GoogleDriveService = require('../services/googleDriveService');
const Users = require('../models/UsersModel');

class UserController {
  // Create a new user
  static async createUser(req, res) {
    try {
      const { username, email } = req.body; // Destructure the request body

      // Check for duplicate username
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Duplicate username' });
      }

      const newUser = new User({ username, email });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  // Get all users
  static async getAllUsers(req, res) {
    try {
        const users = await User.find(); 
        res.status(200).json(users); 
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
}

  // Get a single user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving user', error });
    }
  }

  // Update a user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  // Delete a user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }
  static async getPendingUsers (req, res) {
    try {
      const pendingUsers = await User.find({ status: 'pending' });
      res.json(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ message: 'Error fetching pending users' });
    }
  }
  static async approveUser (req, res){
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: 'active' },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Error approving user' });
    }
  }
  static async getUserProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id)
            .select('-password')
            .lean();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            username: user.username || '',
            email: user.email || '',
            organization: user.organization || '',
            role: user.role || '',
            status: user.status || '',
            profilePicture: user.profilePicture || '/default-avatar.png'
        });
    } catch (error) {
        console.error('getUserProfile error:', error);
        return res.status(500).json({ 
            message: 'Error retrieving user profile'
        });
    }
  }
  static async updateProfile(req, res) {
    try {
      const { username, email, organization, role, password } = req.body;
      const userId = req.user.id;

      // Validate the input
      if (!username || !email || !organization) {
        return res.status(400).json({ message: 'Required fields are missing' });
      }

      // Check if username or email already exists (excluding current user)
      const existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: email }
        ],
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.username === username 
            ? 'Username already taken' 
            : 'Email already registered' 
        });
      }

      // Create update object without password
      const updateData = {
        username,
        email,
        organization,
        role
      };

      // If password is provided, handle it separately
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { 
          new: true,
          runValidators: true 
        }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          username: user.username,
          email: user.email,
          organization: user.organization,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        message: error.name === 'ValidationError' 
          ? error.message 
          : 'Error updating profile'
      });
    }
  }

  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG and GIF are allowed.' });
      }

      // Upload to Google Drive
      const driveResponse = await GoogleDriveService.uploadFile(req.file);

      // Update user profile
      const user = await Users.findById(req.user.id);
      
      // If there's an existing profile picture, delete it from Drive
      if (user.profilePictureId) {
        try {
          await GoogleDriveService.deleteFile(user.profilePictureId);
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
        }
      }

      // Update user with new profile picture details
      await user.updateProfilePicture(driveResponse.id, driveResponse.webViewLink);

      res.json({
        success: true,
        profilePictureUrl: driveResponse.webViewLink
      });

    } catch (error) {
      console.error('Error in upload:', error);
      res.status(500).json({ message: 'Error uploading profile picture' });
    }
  }
}
  
module.exports = UserController;