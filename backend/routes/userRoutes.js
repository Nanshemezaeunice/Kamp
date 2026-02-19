// User account management — fetch your own details, update name/email, change password.
// Only the account owner can access their own data (no user-A reading user-B).
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OrgProfile = require("../models/OrgProfile");
const IndividualProfile = require("../models/IndividualProfile");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Please authenticate." });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ message: "Please authenticate." });
  }
};

// @route   GET /api/users/:id
// @desc    Get user and profile information
router.get("/:id", auth, async (req, res) => {
  try {
    if (req.params.id !== req.userId && req.params.id !== 'me') {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const userId = req.params.id === 'me' ? req.userId : req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = null;
    if (user.type === "Organization") {
      profile = await OrgProfile.findOne({ userId });
    } else if (user.type === "Individual") {
      profile = await IndividualProfile.findOne({ userId });
    }

    res.json({
      ...user.toObject(),
      profile: profile ? profile.toObject() : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user and profile information
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.params.id !== req.userId && req.params.id !== 'me') {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const userId = req.params.id === 'me' ? req.userId : req.params.id;
    const { name, email, ...profileData } = req.body;

    // Update User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    // Update Profile
    let profile = null;
    if (user.type === "Organization") {
      profile = await OrgProfile.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true }
      );
    } else if (user.type === "Individual") {
      profile = await IndividualProfile.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true }
      );
    }

    res.json({
      ...user.toObject(),
      password: "", // Hide password
      profile: profile ? profile.toObject() : null
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Update user password
router.put("/:id/password", auth, async (req, res) => {
  try {
    if (req.params.id !== req.userId && req.params.id !== 'me') {
        return res.status(403).json({ message: "Access denied" });
    }
    
    const userId = req.params.id === 'me' ? req.userId : req.params.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
