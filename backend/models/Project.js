const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ngos: { type: [String], required: true },
  categories: { type: [String], required: true },
  districts: { type: [String], required: true },
  targetAudience: { type: [String], required: true },
  status: { type: String, default: 'Planned' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  donors: { type: Number, default: 0 },
  budgetBreakdown: { type: String },
  ngoRoles: { type: String },
  description: { type: String, required: true },
  milestones: { type: String },
  impactGoals: { type: String },
  isPublic: { type: Boolean, default: true },
  isOpenForDonations: { type: Boolean, default: true },
  isOpenForOrganizations: { type: Boolean, default: true },
  complianceAgreed: { type: Boolean, required: true },
  image: { type: String },
  imageType: { type: String, enum: ['link', 'upload'], default: 'link' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
