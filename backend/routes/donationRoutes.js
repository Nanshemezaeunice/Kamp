// Donation routes — record incoming donations and keep project totals in sync.
// Note: payment processing is handled client-side; we just persist the completed transaction.
const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Project = require('../models/Project');

// POST /api/donations — save a new donation and bump the project's raised + donor counters
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

    // Atomically increment raised and donor count so we never have a stale read
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

// GET /api/donations/project/:projectId — all donations for a single project, newest first
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
