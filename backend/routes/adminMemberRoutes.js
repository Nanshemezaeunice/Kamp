const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// Get all admins
router.get('/', adminAuth, async (req, res) => {
  try {
    const admins = await User.find({ type: 'Admin' }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const admin = new User({ 
      name, 
      email, 
      password, 
      type: 'Admin' 
    });
    
    await admin.save();
    res.status(201).json({ 
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      type: admin.type
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await User.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    if (password) {
      admin.password = password;
    }

    await admin.save();
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      type: admin.type
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
