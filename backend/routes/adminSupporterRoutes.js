const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const IndividualProfile = require("../models/IndividualProfile");
const adminAuth = require("../middleware/adminAuth");

// Get all advocates with user details
router.get("/", adminAuth, async (req, res) => {
  try {
    const advocates = await IndividualProfile.find().populate("userId", "name email createdAt");
    res.json(advocates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single advocate details
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const advocate = await IndividualProfile.findById(req.params.id).populate("userId", "name email createdAt");
    if (!advocate) {
      return res.status(404).json({ message: "Advocate not found" });
    }
    res.json(advocate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update advocate status (verify)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { setupStatus } = req.body;
    
    if (!["details_pending", "under_review", "verified", "rejected"].includes(setupStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const advocate = await IndividualProfile.findByIdAndUpdate(
      req.params.id,
      { setupStatus },
      { new: true }
    ).populate("userId", "name email");
    
    if (!advocate) {
      return res.status(404).json({ message: "Advocate not found" });
    }
    
    // Also update the user's setupStatus
    await User.findByIdAndUpdate(advocate.userId._id, { setupStatus });
    
    res.json(advocate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ban/Suspend advocate (only verified advocates)
router.put("/:id/action", adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'ban' or 'suspend'
    
    const advocate = await IndividualProfile.findById(req.params.id).populate("userId");
    if (!advocate) {
      return res.status(404).json({ message: "Advocate not found" });
    }
    
    if (advocate.setupStatus !== "verified") {
      return res.status(400).json({ message: "Only verified advocates can be banned or suspended" });
    }
    
    // Update the advocate status
    const newStatus = action === "ban" ? "banned" : "suspended";
    advocate.setupStatus = newStatus;
    advocate.actionReason = reason || "";
    await advocate.save();
    
    // Update user status
    await User.findByIdAndUpdate(advocate.userId._id, { 
      setupStatus: newStatus,
      accountStatus: newStatus 
    });
    
    res.json(advocate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete advocate
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const advocate = await IndividualProfile.findById(req.params.id);
    if (!advocate) {
      return res.status(404).json({ message: "Advocate not found" });
    }
    
    // Delete the user account as well
    await User.findByIdAndDelete(advocate.userId);
    await IndividualProfile.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Advocate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
