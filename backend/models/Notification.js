// In-app notification record — covers partner invitations, project status changes and general alerts.
// The compound index on (userId, read) keeps the unread-count query fast.
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['partner_invitation', 'project_approved', 'project_rejected', 'partner_accepted', 'partner_declined', 'general'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
