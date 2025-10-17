const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Store this securely

// Register route
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ 
      id: newUser._id, 
      firstName: newUser.firstName, 
      lastName: newUser.lastName, 
      email: newUser.email 
    }, JWT_SECRET, { expiresIn: '1h' });
    console.log("User registered")
    res.status(200).json({ message: 'User registered', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(200).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ 
      id: user._id, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' }); 
    console.log('Login successful')   
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password route
router.post('/change_password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  try {
    // Get the token from headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Verify the token and decode user info
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Compare the current password with the one stored in the DB
    const validPassword = await user.comparePassword(oldPassword);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Set the new password
    user.password = newPassword;
    await user.save();

    // Generate new JWT
    const newToken = jwt.sign({ 
      id: user._id, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' });

    console.log('Password changed successfully');
    res.status(200).json({ message: 'Password changed successfully', token: newToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;