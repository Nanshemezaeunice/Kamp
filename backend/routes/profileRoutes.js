const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const OrgProfile = require("../models/OrgProfile");
const IndividualProfile = require("../models/IndividualProfile");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Please authenticate." });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

// ─── Organization Profile ───

// Get org profile
router.get("/org/me", auth, async (req, res) => {
  try {
    const profile = await OrgProfile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update org profile (used by setup page)
router.put("/org/me", auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.finalize) {
      updates.setupStatus = "under_review";
      delete updates.finalize;
    }

    const profile = await OrgProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ─── Individual Profile ───

// Get individual profile
router.get("/individual/me", auth, async (req, res) => {
  try {
    const profile = await IndividualProfile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update individual profile
router.put("/individual/me", auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.finalize) {
      updates.setupStatus = "under_review";
      delete updates.finalize;
    }

    const profile = await IndividualProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
