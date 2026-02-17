const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const OrgProfile = require('../models/OrgProfile');
const Donation = require('../models/Donation');
const Expenditure = require('../models/Expenditure');
const IndividualProfile = require('../models/IndividualProfile');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

// GET /api/stats/about - Public stats for the about page
router.get('/about', async (req, res) => {
  try {
    const activeProjects = await Project.countDocuments({ 
      approvalStatus: 'approved',
      status: { $in: ['Ongoing', 'Planned', 'Planning'] }
    });
    
    const partnerOrgs = await OrgProfile.countDocuments({ setupStatus: 'verified' });
    
    const donations = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const fundsTracked = donations.length > 0 ? donations[0].total : 0;
    
    // Sum livesImpacted from approved projects
    const impactResult = await Project.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: null, total: { $sum: '$livesImpacted' } } }
    ]);
    const livesImpacted = impactResult.length > 0 ? impactResult[0].total : 0;
    
    res.json({
      activeProjects,
      partnerOrgs,
      fundsTracked,
      livesImpacted
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stats/admin/funds - Admin funds tracking (approved projects)
router.get('/admin/funds', async (req, res) => {
  try {
    const projects = await Project.find({ approvalStatus: 'approved' })
      .select('name goal raised memberFunds totalSpent status startDate endDate isOpenForDonations partnerOrganisations partnerAdvocates')
      .populate('creatorId', 'name')
      .sort({ createdAt: -1 });
    
    const allDonations = await Donation.find()
      .populate('projectId', 'name')
      .populate('userId', 'name type')
      .sort({ createdAt: -1 });
    
    const allExpenditures = await Expenditure.find()
      .populate('projectId', 'name')
      .populate('recordedBy', 'name')
      .sort({ date: -1 });
    
    // Per-project fund summary
    const projectFunds = await Promise.all(projects.map(async (project) => {
      const donations = await Donation.find({ projectId: project._id });
      const expenditures = await Expenditure.find({ projectId: project._id });
      
      const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
      const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
      
      return {
        project: {
          _id: project._id,
          name: project.name,
          goal: project.goal,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          isOpenForDonations: project.isOpenForDonations,
          creator: project.creatorId?.name || 'Unknown',
          partnerOrganisations: project.partnerOrganisations || [],
          partnerAdvocates: project.partnerAdvocates || []
        },
        totalDonated,
        memberFunds: project.memberFunds || 0,
        totalFunds: totalDonated + (project.memberFunds || 0),
        totalSpent,
        balance: totalDonated + (project.memberFunds || 0) - totalSpent,
        donorCount: donations.length,
        expenditureCount: expenditures.length
      };
    }));
    
    // Overall summary
    const totalDonations = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = allExpenditures.reduce((sum, e) => sum + e.amount, 0);
    const totalMemberFunds = projects.reduce((sum, p) => sum + (p.memberFunds || 0), 0);
    
    res.json({
      summary: {
        totalProjects: projects.length,
        totalDonations,
        totalMemberFunds,
        totalFunds: totalDonations + totalMemberFunds,
        totalExpenses,
        netBalance: totalDonations + totalMemberFunds - totalExpenses,
        totalGoal: projects.reduce((sum, p) => sum + p.goal, 0)
      },
      projectFunds,
      recentDonations: allDonations.slice(0, 20),
      recentExpenditures: allExpenditures.slice(0, 20)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stats/verified-partners - Get verified orgs and advocates for project creation
router.get('/verified-partners', async (req, res) => {
  try {
    const verifiedOrgs = await OrgProfile.find({ setupStatus: 'verified' })
      .populate('userId', 'name email type');
    
    const verifiedAdvocates = await IndividualProfile.find({ setupStatus: 'verified' })
      .populate('userId', 'name email type');
    
    res.json({
      organisations: verifiedOrgs.map(org => ({
        _id: org._id,
        userId: org.userId?._id,
        name: org.userId?.name || 'Unknown',
        email: org.userId?.email,
        category: org.category,
        organisationType: org.organisationType || 'NGO'
      })),
      advocates: verifiedAdvocates.map(adv => ({
        _id: adv._id,
        userId: adv.userId?._id,
        name: adv.userId?.name || 'Unknown',
        email: adv.userId?.email,
        interest: adv.interest
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stats/partners - Public page listing all registered organisations and advocates with their projects
router.get('/partners', async (req, res) => {
  try {
    // Get all verified organisations
    const orgs = await OrgProfile.find({ setupStatus: 'verified' })
      .populate('userId', 'name email type');
    
    // Get all verified advocates
    const advocates = await IndividualProfile.find({ setupStatus: 'verified' })
      .populate('userId', 'name email type');
    
    // Get all approved projects to link partners
    const projects = await Project.find({ approvalStatus: 'approved' })
      .select('name status categories startDate endDate goal raised image creatorId partnerOrganisations partnerAdvocates achievements structuredMilestones');
    
    // Build org details with their projects
    const orgDetails = orgs.map(org => {
      const userId = org.userId?._id?.toString();
      const involvedProjects = projects.filter(p => {
        if (p.creatorId?.toString() === userId) return true;
        if (p.partnerOrganisations?.some(po => po.userId?.toString() === userId && po.status === 'accepted')) return true;
        return false;
      });
      
      // Collect achievements from involved projects
      const allAchievements = involvedProjects.flatMap(p => 
        (p.achievements || []).map(a => ({ ...a.toObject(), projectName: p.name }))
      );
      
      return {
        _id: org._id,
        userId: userId,
        name: org.userId?.name || 'Unknown',
        email: org.userId?.email,
        type: 'Organization',
        category: org.category,
        organisationType: org.organisationType || 'NGO',
        description: org.description,
        address: org.address,
        website: org.website,
        projects: involvedProjects.map(p => ({
          _id: p._id,
          name: p.name,
          status: p.status,
          categories: p.categories,
          goal: p.goal,
          raised: p.raised || 0,
          image: p.image
        })),
        achievements: allAchievements.slice(0, 5),
        projectCount: involvedProjects.length
      };
    });
    
    // Build advocate details with their projects
    const advDetails = advocates.map(adv => {
      const userId = adv.userId?._id?.toString();
      const involvedProjects = projects.filter(p => {
        if (p.creatorId?.toString() === userId) return true;
        if (p.partnerAdvocates?.some(pa => pa.userId?.toString() === userId && pa.status === 'accepted')) return true;
        return false;
      });
      
      const allAchievements = involvedProjects.flatMap(p => 
        (p.achievements || []).map(a => ({ ...a.toObject(), projectName: p.name }))
      );
      
      return {
        _id: adv._id,
        userId: userId,
        name: adv.userId?.name || 'Unknown',
        email: adv.userId?.email,
        type: 'Individual',
        interest: adv.interest,
        bio: adv.bio,
        location: adv.location,
        projects: involvedProjects.map(p => ({
          _id: p._id,
          name: p.name,
          status: p.status,
          categories: p.categories,
          goal: p.goal,
          raised: p.raised || 0,
          image: p.image
        })),
        achievements: allAchievements.slice(0, 5),
        projectCount: involvedProjects.length
      };
    });
    
    res.json({ organisations: orgDetails, advocates: advDetails });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stats/my-dashboard - Dashboard stats scoped to the logged-in user's projects
router.get('/my-dashboard', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find projects where user is creator, accepted partner org, or accepted partner advocate
    const myProjects = await Project.find({
      approvalStatus: 'approved',
      $or: [
        { creatorId: userId },
        { 'partnerOrganisations.userId': userId, 'partnerOrganisations.status': 'accepted' },
        { 'partnerAdvocates.userId': userId, 'partnerAdvocates.status': 'accepted' }
      ]
    });
    
    // Also include projects where user has an accepted application
    const acceptedApps = await Application.find({ userId, status: 'accepted' }).select('projectId');
    const appProjectIds = acceptedApps.map(a => a.projectId);
    const appProjects = await Project.find({ 
      _id: { $in: appProjectIds }, 
      approvalStatus: 'approved' 
    });
    
    // Merge and deduplicate
    const allProjectMap = {};
    [...myProjects, ...appProjects].forEach(p => { allProjectMap[p._id.toString()] = p; });
    const projects = Object.values(allProjectMap);
    const projectIds = projects.map(p => p._id);
    
    // Get donations for these projects
    const donations = await Donation.find({ projectId: { $in: projectIds } });
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    
    // Get expenditures for these projects
    const expenditures = await Expenditure.find({ projectId: { $in: projectIds } });
    const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
    
    res.json({
      projects: projects.length,
      donations: donations.length,
      totalRaised,
      totalSpent,
      balance: totalRaised - totalSpent,
      projectList: projects.map(p => ({
        _id: p._id,
        name: p.name,
        status: p.status,
        goal: p.goal,
        raised: p.raised || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
