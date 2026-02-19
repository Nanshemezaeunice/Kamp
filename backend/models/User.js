// The core user record for authentication and role management.
// Profiles (OrgProfile / IndividualProfile) extend this with domain-specific data.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 'Individual' = supporter/advocate, 'Organization' = NGO or implementing body, 'Admin' = platform staff
  type: { type: String, enum: ['Individual', 'Organization', 'Admin'], default: 'Organization' },
  createdAt: { type: Date, default: Date.now }
});

// Hash the password before saving — we never store plain text
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Convenience method used in the login route to verify a candidate password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
