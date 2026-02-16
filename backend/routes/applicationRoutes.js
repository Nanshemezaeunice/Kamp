const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Submit a new application (authenticated)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { projectId, involvementType, message, applicantType } = req.body;
    if (!projectId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Application.findOne({ projectId, userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this project", application: existing });
    }

    const app = await Application.create({
      projectId,
      userId: req.user.id,
      applicantType: applicantType || "advocate",
      involvementType,
      message,
    });
    res.status(201).json({ message: "Application submitted successfully", application: app });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// Get current user's applications
router.get("/my-applications", verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate("projectId")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Check if user applied for a specific project
router.get("/check/:projectId", verifyToken, async (req, res) => {
  try {
    const application = await Application.findOne({ projectId: req.params.projectId, userId: req.user.id });
    res.json({ applied: !!application, application });
  } catch {
    res.status(500).json({ message: "Failed to check application status" });
  }
});

// Admin: Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("projectId", "name description image")
      .populate("userId", "name email type")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Admin: Get applications for a specific project
router.get("/project/:projectId", async (req, res) => {
  try {
    const applications = await Application.find({ projectId: req.params.projectId })
      .populate("userId", "name email type")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project applications" });
  }
});

// Admin: Get application counts for a specific project
router.get("/project/:projectId/counts", async (req, res) => {
  try {
    const orgs = await Application.countDocuments({ 
      projectId: req.params.projectId, 
      applicantType: "organization",
      status: { $in: ["pending", "reviewed"] }
    });
    const advocates = await Application.countDocuments({ 
      projectId: req.params.projectId, 
      applicantType: "advocate",
      status: { $in: ["pending", "reviewed"] }
    });
    res.json({ organizations: orgs, advocates });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch application counts" });
  }
});

// Admin: Get applications by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId })
      .populate("projectId", "name description image goal raised status categories")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user applications" });
  }
});

// Admin: Update application status
router.patch("/:id", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updateData = { status };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    
    const application = await Application.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("projectId", "name")
      .populate("userId", "name email type");
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Failed to update application" });
  }
});

module.exports = router;
