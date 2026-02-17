const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  partners: { type: [String], default: [] },
  ngos: { type: [String], default: [] },
  // Referenced partner organisations (verified)
  partnerOrganisations: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    contribution: { type: Number, default: 0 },
    status: { type: String, enum: ['invited', 'accepted', 'declined'], default: 'invited' }
  }],
  // Referenced partner advocates (verified)
  partnerAdvocates: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    contribution: { type: Number, default: 0 },
    status: { type: String, enum: ['invited', 'accepted', 'declined'], default: 'invited' }
  }],
  categories: { type: [String], required: true },
  districts: { type: [String], required: true },
  targetAudience: { type: [String], required: true },
  status: { type: String, enum: ['Planning', 'Planned', 'Ongoing', 'Completed'], default: 'Planning' },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  donors: { type: Number, default: 0 },
  // Funding contributed by partners/members (separate from donations)
  memberFunds: { type: Number, default: 0 },
  budgetBreakdown: { type: String },
  ngoRoles: { type: String },
  description: { type: String, required: true },
  milestones: { type: String },
  impactGoals: { type: String },

  // Structured milestones for tracking
  structuredMilestones: [{
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date },
    completedDate: { type: Date },
    status: { 
      type: String, 
      enum: ['not-started', 'in-progress', 'completed'], 
      default: 'not-started' 
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now }
  }],

  // Achievements / impact records
  achievements: [{
    title: { type: String, required: true },
    description: { type: String },
    metric: { type: String },         // e.g. "People reached", "Wells built"
    value: { type: Number },          // e.g. 500
    date: { type: Date, default: Date.now },
    evidence: { type: String },       // URL or base64 image
    createdAt: { type: Date, default: Date.now }
  }],

  // Budget allocation categories for tracking
  budgetAllocations: [{
    category: { type: String, required: true },
    allocated: { type: Number, required: true, min: 0 },
    description: { type: String }
  }],

  totalSpent: { type: Number, default: 0 },

  isPublic: { type: Boolean, default: true },
  isOpenForDonations: { type: Boolean, default: true },
  isOpenForOrganizations: { type: Boolean, default: true },
  complianceAgreed: { type: Boolean, required: true },
  image: { type: String },
  imageType: { type: String, enum: ['link', 'upload'], default: 'link' },
  livesImpacted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-set status based on dates
projectSchema.pre('save', function(next) {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  // Can't be completed if end date hasn't passed
  if (this.status === 'Completed' && now < end) {
    this.status = 'Ongoing';
  }
  // Before commencement = Planning
  if (now < start && this.status !== 'Planning' && this.status !== 'Planned') {
    this.status = 'Planning';
  }
  // If start date has passed and status is still Planning, move to Ongoing
  if (now >= start && now < end && (this.status === 'Planning' || this.status === 'Planned')) {
    this.status = 'Ongoing';
  }
  // If end date has passed, allow Completed
  if (now >= end && this.status === 'Ongoing') {
    this.status = 'Completed';
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);
