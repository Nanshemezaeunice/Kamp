const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OrgProfile = require("../models/OrgProfile");
const Project = require("../models/Project");
const adminAuth = require("../middleware/adminAuth");

// Get all organizations with user details
router.get("/", adminAuth, async (req, res) => {
  try {
    const organizations = await OrgProfile.find().populate("userId", "name email createdAt");
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single organization details
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const organization = await OrgProfile.findById(req.params.id).populate("userId", "name email createdAt");
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get organization's projects
router.get("/:id/projects", adminAuth, async (req, res) => {
  try {
    const organization = await OrgProfile.findById(req.params.id).populate("userId", "name");
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    const orgName = organization.userId.name;
    const projects = await Project.find({ ngos: orgName });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update organization status (verify)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { setupStatus } = req.body;
    
    if (!["details_pending", "under_review", "verified", "rejected"].includes(setupStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const organization = await OrgProfile.findByIdAndUpdate(
      req.params.id,
      { setupStatus },
      { new: true }
    ).populate("userId", "name email");
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    // Also update the user's setupStatus
    await User.findByIdAndUpdate(organization.userId._id, { setupStatus });
    
    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ban/Suspend organization (only verified orgs)
router.put("/:id/action", adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'ban' or 'suspend'
    
    const organization = await OrgProfile.findById(req.params.id).populate("userId");
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    if (organization.setupStatus !== "verified") {
      return res.status(400).json({ message: "Only verified organizations can be banned or suspended" });
    }
    
    // Update the organization status
    const newStatus = action === "ban" ? "banned" : "suspended";
    organization.setupStatus = newStatus;
    organization.actionReason = reason || "";
    await organization.save();
    
    // Update user status
    await User.findByIdAndUpdate(organization.userId._id, { 
      setupStatus: newStatus,
      accountStatus: newStatus 
    });
    
    res.json(organization);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete organization
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const organization = await OrgProfile.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    // Delete the user account as well
    await User.findByIdAndDelete(organization.userId);
    await OrgProfile.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
