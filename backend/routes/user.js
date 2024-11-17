const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(400).send('Error registering user');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(400).send('Error logging in');
  }
});

// Get account info (protected)
router.get('/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Buy Cryptocurrency
router.post('/buy', authMiddleware, async (req, res) => {
  const { amount, selectedCrypto, price } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (user.balance < amount * price) {
      return res.status(400).send('Insufficient balance');
    }

    user.balance -= amount * price;
    user.statements.push(`Bought ${amount} of ${selectedCrypto} for ${amount * price} USD`);
    await user.save();
    res.send('Purchase successful');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Sell Cryptocurrency
router.post('/sell', authMiddleware, async (req, res) => {
  const { amount, selectedCrypto, price } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    user.balance += amount * price;
    user.statements.push(`Sold ${amount} of ${selectedCrypto} for ${amount * price} USD`);
    await user.save();
    res.send('Sell successful');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
