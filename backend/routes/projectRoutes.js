const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Application = require('../models/Application');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kamp_secret_key_2026';

// Helper to get user from token if exists (without throwing error)
const getOptionalUser = async (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Helper: check if user is a member of a project (creator, partner, or accepted applicant)
const isProjectMember = async (userId, project) => {
  if (!userId) return false;
  if (project.creatorId && project.creatorId.toString() === userId) return true;
  // Check if user has an accepted application for this project
  const app = await Application.findOne({ projectId: project._id, userId, status: 'accepted' });
  return !!app;
};

// Sanitize project data for non-registered users (public view)
const publicProjectView = (project) => {
  const p = project.toObject ? project.toObject() : { ...project };
  // Hide sensitive internal details from non-registered users
  delete p.budgetBreakdown;
  delete p.ngoRoles;
  delete p.milestones;
  delete p.impactGoals;
  return p;
};

// Sanitize project data for registered users who are NOT project members
const registeredNonMemberView = (project) => {
  const p = project.toObject ? project.toObject() : { ...project };
  // Hide detailed financial info from non-members
  delete p.budgetBreakdown;
  delete p.ngoRoles;
  return p;
};

// @route   GET /api/projects
// @desc    Get all projects (filtered by approval status and visibility)
router.get('/', async (req, res) => {
  try {
    const decoded = await getOptionalUser(req);
    let query = {};
    const User = require('../models/User');
    let user = null;

    if (decoded) {
      user = await User.findById(decoded.id);
      
      if (user && user.type === 'Admin') {
        // Admin sees everything
        query = {};
      } else {
        // Logged in user sees:
        // - All approved public projects
        // - All approved private projects (registered user)
        // - Their own pending/rejected projects
        query = {
          $or: [
            { approvalStatus: 'approved' },
            { approvalStatus: { $exists: false } },
            { creatorId: decoded.id }
          ]
        };
      }
    } else {
      // Non-logged in users only see approved PUBLIC projects
      query = { 
        $or: [
          { approvalStatus: 'approved', isPublic: true },
          { approvalStatus: { $exists: false }, isPublic: { $ne: false } }
        ]
      };
    }

    let projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('creatorId', 'name email type');

    // Sanitize project data based on user role
    if (!decoded) {
      // Non-logged-in: public view only
      projects = projects.map(p => publicProjectView(p));
    } else if (user && user.type !== 'Admin') {
      // Logged-in non-admin: show milestones/impactGoals but hide budget details for non-members
      // (Full member check is done per-project on detail view)
      projects = projects.map(p => registeredNonMemberView(p));
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project (Admin, Organization, or Individual/Advocate)
router.post('/', auth, async (req, res) => {
  const projectData = {
    ...req.body,
    creatorId: req.userId,
    // Admin projects are auto-approved; org/advocate projects require admin review
    approvalStatus: req.user.type === 'Admin' ? 'approved' : 'pending'
  };
  
  const project = new Project(projectData);
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project (Admin can update any, creator/members can update their own)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAdmin = req.user.type === 'Admin';
    const isCreator = project.creatorId && project.creatorId.toString() === req.userId;
    const isMember = await isProjectMember(req.userId, project);

    if (!isAdmin && !isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied. You can only manage projects you are involved in.' });
    }

    // Non-admin updates should not change approvalStatus
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.approvalStatus;
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/projects/:id/approve
// @desc    Approve a project (Admin only)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.approvalStatus = 'approved';
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/projects/:id/reject
// @desc    Reject a project (Admin only)
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.approvalStatus = 'rejected';
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID (with visibility controls)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('creatorId', 'name email type');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const decoded = await getOptionalUser(req);
    const User = require('../models/User');
    const user = decoded ? await User.findById(decoded.id) : null;
    const isAdmin = user && user.type === 'Admin';
    const isCreator = decoded && project.creatorId && (project.creatorId._id || project.creatorId).toString() === decoded.id;
    const isMember = decoded ? await isProjectMember(decoded.id, project) : false;

    // Block unapproved projects for non-admin/non-creator
    if (project.approvalStatus !== 'approved' && !isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Project not approved yet' });
    }

    // Private projects: only visible to registered users
    if (!project.isPublic && !decoded) {
      return res.status(403).json({ message: 'This project is only visible to registered users. Please log in.' });
    }

    // Return different levels of detail based on role
    if (isAdmin || isCreator || isMember) {
      // Full project details for admins, creators, and project members
      return res.json(project);
    } else if (decoded) {
      // Registered user but not a member: hide budget details
      return res.json(registeredNonMemberView(project));
    } else {
      // Non-registered user: basic public info only
      return res.json(publicProjectView(project));
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
