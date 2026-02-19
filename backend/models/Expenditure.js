// Tracks every expense charged against a project budget.
// Storing the receipt and vendor info makes auditing much easier down the line.
const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Personnel', 'Equipment', 'Supplies', 'Transport', 
      'Construction', 'Training', 'Administration', 
      'Communication', 'Monitoring', 'Other'
    ]
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  receipt: { type: String },           // URL or base64 image of receipt
  vendor: { type: String },            // Who was paid
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged'], 
    default: 'pending' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expenditure', expenditureSchema);
