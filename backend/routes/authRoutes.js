const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OrgProfile = require('../models/OrgProfile');
const IndividualProfile = require('../models/IndividualProfile');

const JWT_SECRET = process.env.JWT_SECRET || 'kamp_secret_key_2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, type, category, description, phone, interest } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = new User({ name, email, password, type });
    await user.save();

    let setupStatus = 'verified';

    if (type === 'Organization') {
      const profile = new OrgProfile({
        userId: user._id,
        category: category || 'Other',
        description: description || '',
        phone: phone || '',
        setupStatus: 'details_pending',
      });
      await profile.save();
      setupStatus = 'details_pending';
    } else if (type === 'Individual') {
      const profile = new IndividualProfile({
        userId: user._id,
        phone: phone || '',
        interest: interest || 'Donating',
        setupStatus: 'details_pending',
      });
      await profile.save();
      setupStatus = 'details_pending';
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      user: { id: user._id, name, email, type, setupStatus }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      let setupStatus = 'verified';

      if (user.type === 'Organization') {
        const profile = await OrgProfile.findOne({ userId: user._id });
        setupStatus = profile ? profile.setupStatus : 'details_pending';
      } else if (user.type === 'Individual') {
        const profile = await IndividualProfile.findOne({ userId: user._id });
        setupStatus = profile ? profile.setupStatus : 'details_pending';
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          type: user.type,
          setupStatus 
        }, 
        token 
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
