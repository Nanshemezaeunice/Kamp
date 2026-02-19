// Tracks every donation made to a project.
// userId is optional because anonymous/public donations are allowed.
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for anonymous donors
  donorType: { type: String, enum: ['Individual', 'Organization'], required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  message: { type: String },
  cause: { type: String, required: true }, // the specific funding category this donor cares about
  paymentMethod: { type: String, enum: ['Card', 'Mobile Money'], default: 'Card' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);
