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
    res.status(201).json({ message: 'User registered', token });
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
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ 
      id: user._id, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' }); 
    console.log('Login successful')   
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;