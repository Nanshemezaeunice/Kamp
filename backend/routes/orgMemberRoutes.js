// Organisation sub-team management.
// An org owner can invite colleagues (OrganizationMembers) who then get read access to that org's projects.
const express = require("express");
const router = express.Router();
const OrganizationMember = require("../models/OrganizationMember");
const User = require("../models/User");
const OrgProfile = require("../models/OrgProfile");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kamp_secret_key_2026";

// Middleware to verify JWT token and check if user is organization owner
const verifyOrgOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.type !== "Organization") {
      return res.status(403).json({ message: "Access denied. Organization account required." });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify member has permission to manage members
const verifyMemberPermission = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if it's the organization owner
    const user = await User.findById(decoded.id);
    if (user && user.type === "Organization") {
      req.userId = decoded.id;
      req.isOwner = true;
      return next();
    }

    // Check if it's a member with admin role
    const member = await OrganizationMember.findOne({ 
      _id: decoded.memberId,
      isActive: true 
    });
    
    if (!member || !member.permissions.canManageMembers) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }

    req.organizationId = member.organizationId;
    req.memberId = decoded.memberId;
    req.isOwner = false;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get all members for the organization
router.get("/", verifyOrgOwner, async (req, res) => {
  try {
    const members = await OrganizationMember.find({ 
      organizationId: req.userId,
      isActive: true 
    }).select("-password").sort({ createdAt: -1 });
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
});

// Create a new member
router.post("/", verifyOrgOwner, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if member already exists in this organization
    const existingMember = await OrganizationMember.findOne({
      organizationId: req.userId,
      email: email.toLowerCase(),
    });

    if (existingMember) {
      return res.status(400).json({ message: "A member with this email already exists in your organization" });
    }

    // Create new member
    const member = new OrganizationMember({
      organizationId: req.userId,
      name,
      email: email.toLowerCase(),
      password,
      role: role || "member",
    });

    await member.save();

    // Return member without password
    const memberData = member.toObject();
    delete memberData.password;

    res.status(201).json({ 
      message: "Member created successfully", 
      member: memberData 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A member with this email already exists" });
    }
    res.status(500).json({ message: "Failed to create member", error: error.message });
  }
});

// Update a member
router.put("/:id", verifyOrgOwner, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const member = await OrganizationMember.findOne({
      _id: req.params.id,
      organizationId: req.userId,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Update fields
    if (name) member.name = name;
    if (email) member.email = email.toLowerCase();
    if (role) member.role = role;
    if (password) member.password = password; // Will be hashed by pre-save hook

    await member.save();

    const memberData = member.toObject();
    delete memberData.password;

    res.json({ 
      message: "Member updated successfully", 
      member: memberData 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A member with this email already exists" });
    }
    res.status(500).json({ message: "Failed to update member", error: error.message });
  }
});

// Delete a member (soft delete by setting isActive to false)
router.delete("/:id", verifyOrgOwner, async (req, res) => {
  try {
    const member = await OrganizationMember.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.userId,
      },
      { isActive: false },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete member", error: error.message });
  }
});

// Member login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const member = await OrganizationMember.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).populate("organizationId", "name email");

    if (!member) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await member.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create token with member ID
    const token = jwt.sign(
      { 
        memberId: member._id, 
        organizationId: member.organizationId._id,
        role: member.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const memberData = member.toObject();
    delete memberData.password;

    res.json({
      token,
      member: memberData,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;
