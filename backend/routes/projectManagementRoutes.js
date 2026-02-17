const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Expenditure = require('../models/Expenditure');
const Donation = require('../models/Donation');
const Application = require('../models/Application');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kamp_secret_key_2026';

// Helper: optional auth (doesn't reject unauthenticated users)
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded;
  } catch (err) {
    // invalid token, proceed without auth
  }
  next();
};

// ─── Middleware: verify user is project member (creator, admin, or accepted applicant/partner) ───
const requireProjectAccess = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('creatorId', 'name email type');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAdmin = req.user.type === 'Admin';
    const isCreator = project.creatorId && (project.creatorId._id || project.creatorId).toString() === req.userId;
    
    // Check accepted applications
    const acceptedApp = await Application.findOne({ 
      projectId: project._id, userId: req.userId, status: 'accepted' 
    });
    
    // Check partner organisations and advocates
    const isPartnerOrg = project.partnerOrganisations?.some(
      p => p.userId?.toString() === req.userId && p.status === 'accepted'
    );
    const isPartnerAdv = project.partnerAdvocates?.some(
      p => p.userId?.toString() === req.userId && p.status === 'accepted'
    );
    
    const isMember = !!acceptedApp || isPartnerOrg || isPartnerAdv;

    if (!isAdmin && !isCreator && !isMember) {
      return res.status(403).json({ message: 'Access denied. You must be a project member.' });
    }

    req.project = project;
    req.isAdmin = isAdmin;
    req.isCreator = isCreator;
    req.isMember = isMember;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════
//  FINANCIAL SUMMARY
// ═══════════════════════════════════════════════

// @route   GET /api/project-manage/:projectId/finances
// @desc    Get full financial summary (donations + expenditures + budget)
router.get('/:projectId/finances', auth, requireProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get all donations
    const donations = await Donation.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email type');

    // Get all expenditures
    const expenditures = await Expenditure.find({ projectId })
      .sort({ date: -1 })
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email');

    // Calculate summaries
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenditures
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);
    const approvedExpenses = expenditures
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    // Spending by category
    const spendingByCategory = {};
    expenditures.forEach(e => {
      if (!spendingByCategory[e.category]) {
        spendingByCategory[e.category] = 0;
      }
      spendingByCategory[e.category] += e.amount;
    });

    // Donation by cause/category
    const donationByCause = {};
    donations.forEach(d => {
      const cause = d.cause || 'General';
      if (!donationByCause[cause]) donationByCause[cause] = 0;
      donationByCause[cause] += d.amount;
    });

    res.json({
      summary: {
        goal: req.project.goal,
        totalDonated,
        totalSpent,
        balance: totalDonated - totalSpent,
        pendingExpenses,
        approvedExpenses,
        donorCount: donations.length,
        budgetAllocations: req.project.budgetAllocations || []
      },
      spendingByCategory,
      donationByCause,
      donations,
      expenditures
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════
//  EXPENDITURES CRUD
// ═══════════════════════════════════════════════

// @route   POST /api/project-manage/:projectId/expenditures
// @desc    Record a new expenditure
router.post('/:projectId/expenditures', auth, requireProjectAccess, async (req, res) => {
  try {
    const expenditure = new Expenditure({
      ...req.body,
      projectId: req.params.projectId,
      recordedBy: req.userId
    });
    await expenditure.save();

    // Update project totalSpent
    await Project.findByIdAndUpdate(req.params.projectId, {
      $inc: { totalSpent: expenditure.amount }
    });

    const populated = await Expenditure.findById(expenditure._id)
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/project-manage/:projectId/expenditures/:expId
// @desc    Update an expenditure
router.put('/:projectId/expenditures/:expId', auth, requireProjectAccess, async (req, res) => {
  try {
    const oldExp = await Expenditure.findById(req.params.expId);
    if (!oldExp) return res.status(404).json({ message: 'Expenditure not found' });

    const amountDiff = (req.body.amount || oldExp.amount) - oldExp.amount;

    const updated = await Expenditure.findByIdAndUpdate(
      req.params.expId, 
      req.body, 
      { new: true }
    ).populate('recordedBy', 'name email').populate('approvedBy', 'name email');

    // Adjust totalSpent
    if (amountDiff !== 0) {
      await Project.findByIdAndUpdate(req.params.projectId, {
        $inc: { totalSpent: amountDiff }
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/project-manage/:projectId/expenditures/:expId/approve
// @desc    Approve an expenditure (admin or project creator)
router.put('/:projectId/expenditures/:expId/approve', auth, requireProjectAccess, async (req, res) => {
  try {
    if (!req.isAdmin && !req.isCreator) {
      return res.status(403).json({ message: 'Only the project head or admin can approve expenditures.' });
    }

    const updated = await Expenditure.findByIdAndUpdate(
      req.params.expId,
      { status: 'approved', approvedBy: req.userId },
      { new: true }
    ).populate('recordedBy', 'name email').populate('approvedBy', 'name email');

    if (!updated) return res.status(404).json({ message: 'Expenditure not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/project-manage/:projectId/expenditures/:expId/flag
// @desc    Flag an expenditure as suspicious
router.put('/:projectId/expenditures/:expId/flag', auth, requireProjectAccess, async (req, res) => {
  try {
    const updated = await Expenditure.findByIdAndUpdate(
      req.params.expId,
      { status: 'flagged', notes: req.body.notes || 'Flagged for review' },
      { new: true }
    ).populate('recordedBy', 'name email').populate('approvedBy', 'name email');

    if (!updated) return res.status(404).json({ message: 'Expenditure not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/project-manage/:projectId/expenditures/:expId
// @desc    Delete an expenditure
router.delete('/:projectId/expenditures/:expId', auth, requireProjectAccess, async (req, res) => {
  try {
    if (!req.isAdmin && !req.isCreator) {
      return res.status(403).json({ message: 'Only the project head or admin can delete expenditures.' });
    }

    const exp = await Expenditure.findByIdAndDelete(req.params.expId);
    if (!exp) return res.status(404).json({ message: 'Expenditure not found' });

    // Reduce totalSpent
    await Project.findByIdAndUpdate(req.params.projectId, {
      $inc: { totalSpent: -exp.amount }
    });

    res.json({ message: 'Expenditure deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════
//  MILESTONES
// ═══════════════════════════════════════════════

// @route   GET /api/project-manage/:projectId/milestones
// @desc    Get all milestones for a project (public - visible to all users)
router.get('/:projectId/milestones', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project.structuredMilestones || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/project-manage/:projectId/milestones
// @desc    Add a new milestone
router.post('/:projectId/milestones', auth, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    project.structuredMilestones.push(req.body);
    await project.save();
    res.status(201).json(project.structuredMilestones);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/project-manage/:projectId/milestones/:msId
// @desc    Update a milestone
router.put('/:projectId/milestones/:msId', auth, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const milestone = project.structuredMilestones.id(req.params.msId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    Object.assign(milestone, req.body);
    if (req.body.status === 'completed' && !milestone.completedDate) {
      milestone.completedDate = new Date();
      milestone.progress = 100;
    }
    await project.save();
    res.json(project.structuredMilestones);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/project-manage/:projectId/milestones/:msId
// @desc    Delete a milestone
router.delete('/:projectId/milestones/:msId', auth, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    project.structuredMilestones.pull(req.params.msId);
    await project.save();
    res.json(project.structuredMilestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════════════

// @route   GET /api/project-manage/:projectId/achievements
// @desc    Get all achievements (public - visible to all users)
router.get('/:projectId/achievements', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project.achievements || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/project-manage/:projectId/achievements
// @desc    Add an achievement
router.post('/:projectId/achievements', auth, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    project.achievements.push(req.body);
    await project.save();
    res.status(201).json(project.achievements);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/project-manage/:projectId/achievements/:achId
// @desc    Delete an achievement
router.delete('/:projectId/achievements/:achId', auth, requireProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    project.achievements.pull(req.params.achId);
    await project.save();
    res.json(project.achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════
//  BUDGET ALLOCATIONS
// ═══════════════════════════════════════════════

// @route   PUT /api/project-manage/:projectId/budget
// @desc    Set/update budget allocations
router.put('/:projectId/budget', auth, requireProjectAccess, async (req, res) => {
  try {
    if (!req.isAdmin && !req.isCreator) {
      return res.status(403).json({ message: 'Only the project head or admin can set budget allocations.' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { budgetAllocations: req.body.allocations },
      { new: true }
    );
    res.json(project.budgetAllocations);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════
//  TEAM / PARTNERS
// ═══════════════════════════════════════════════

// @route   GET /api/project-manage/:projectId/team
// @desc    Get all team members (accepted applications + creator)
router.get('/:projectId/team', auth, requireProjectAccess, async (req, res) => {
  try {
    const applications = await Application.find({ 
      projectId: req.params.projectId,
      status: 'accepted'
    }).populate('userId', 'name email type');

    const creator = req.project.creatorId;

    const team = [
      {
        _id: 'creator',
        userId: creator,
        role: 'Project Head',
        involvementType: 'Creator',
        joinedAt: req.project.createdAt,
        isCreator: true
      },
      ...applications.map(app => ({
        _id: app._id,
        userId: app.userId,
        role: app.involvementType || 'Member',
        involvementType: app.applicantType,
        joinedAt: app.updatedAt,
        isCreator: false
      }))
    ];

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
