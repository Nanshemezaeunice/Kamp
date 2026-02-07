const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Project = require('../models/Project');

// Create a donation
router.post('/', async (req, res) => {
  try {
    const { projectId, amount, donorType, name, message, cause, userId, paymentMethod } = req.body;

    const donation = new Donation({
      projectId,
      amount: Number(amount),
      donorType,
      name,
      message,
      cause,
      userId,
      paymentMethod
    });

    await donation.save();

    // Update project raised amount and donor count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { 
        raised: Number(amount),
        donors: 1
      }
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get donations for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const donations = await Donation.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email type');
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
