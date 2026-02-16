const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantType: {
      type: String,
      enum: ["organization", "advocate"],
      required: true,
    },
    involvementType: {
      type: String,
      enum: ["Technical Support", "Funding", "Resource Provision", "Operations", "Volunteering", "Other"],
      default: "Other",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
