const express = require('express');

const UserController = require('../controllers/userController'); // Adjust path to your UserController

const router = express.Router();
// User registration route
router.post('/register', UserController.createUser);
router.get('/all', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Add this new route to get pending users
router.get('/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Error fetching pending users' });
  }
});

// Add this route to approve a user
router.put('/:id/approve', async (req, res) => {
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
});

module.exports = router;
