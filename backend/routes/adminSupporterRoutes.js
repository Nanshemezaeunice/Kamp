const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const IndividualProfile = require("../models/IndividualProfile");
const adminAuth = require("../middleware/adminAuth");

// Get all supporters with user details
router.get("/", adminAuth, async (req, res) => {
  try {
    const supporters = await IndividualProfile.find().populate("userId", "name email createdAt");
    res.json(supporters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single supporter details
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const supporter = await IndividualProfile.findById(req.params.id).populate("userId", "name email createdAt");
    if (!supporter) {
      return res.status(404).json({ message: "Supporter not found" });
    }
    res.json(supporter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update supporter status (verify)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { setupStatus } = req.body;
    
    if (!["details_pending", "under_review", "verified", "rejected"].includes(setupStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const supporter = await IndividualProfile.findByIdAndUpdate(
      req.params.id,
      { setupStatus },
      { new: true }
    ).populate("userId", "name email");
    
    if (!supporter) {
      return res.status(404).json({ message: "Supporter not found" });
    }
    
    // Also update the user's setupStatus
    await User.findByIdAndUpdate(supporter.userId._id, { setupStatus });
    
    res.json(supporter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ban/Suspend supporter (only verified supporters)
router.put("/:id/action", adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'ban' or 'suspend'
    
    const supporter = await IndividualProfile.findById(req.params.id).populate("userId");
    if (!supporter) {
      return res.status(404).json({ message: "Supporter not found" });
    }
    
    if (supporter.setupStatus !== "verified") {
      return res.status(400).json({ message: "Only verified supporters can be banned or suspended" });
    }
    
    // Update the supporter status
    const newStatus = action === "ban" ? "banned" : "suspended";
    supporter.setupStatus = newStatus;
    supporter.actionReason = reason || "";
    await supporter.save();
    
    // Update user status
    await User.findByIdAndUpdate(supporter.userId._id, { 
      setupStatus: newStatus,
      accountStatus: newStatus 
    });
    
    res.json(supporter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete supporter
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const supporter = await IndividualProfile.findById(req.params.id);
    if (!supporter) {
      return res.status(404).json({ message: "Supporter not found" });
    }
    
    // Delete the user account as well
    await User.findByIdAndDelete(supporter.userId);
    await IndividualProfile.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Supporter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
