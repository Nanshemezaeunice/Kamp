const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// Submit a new application
router.post("/", async (req, res) => {
  try {
    const {
      projectId,
      organizationName,
      representativeName,
      email,
      phone,
      involvementType,
      message,
    } = req.body;

    if (!projectId || !organizationName || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newApplication = new Application({
      projectId,
      organizationName,
      representativeName,
      email,
      phone,
      involvementType,
      message,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// Admin: Get all applications
router.get("/", async (req, res) => {
  try {
    // In a real app, apply admin auth middleware here
    const applications = await Application.find().populate("projectId", "title").sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// Admin: Update application status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Failed to update application" });
  }
});

module.exports = router;
