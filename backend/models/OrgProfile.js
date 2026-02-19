// Detailed profile for Organisation accounts.
// Separated from User so the auth model stays lean.
// setupStatus drives the onboarding flow: details_pending → under_review → verified.
const mongoose = require("mongoose");

const orgProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: [
        "Health",
        "Education",
        "Water & Sanitation",
        "Agriculture",
        "Humanitarian Aid",
        "Gender & Development",
        "Environment",
        "Economic Development",
        "Other",
      ],
      required: true,
    },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    organisationType: {
      type: String,
      enum: ["NGO", "Religious", "Government", "Community-Based", "International", "Private Sector", "Academic/Research", "Other"],
      default: "NGO",
    },

    // Detailed Info (Step 2 - setup page)
    website: { type: String, default: "" },
    address: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    foundingYear: { type: Number, default: null },
    teamSize: { type: String, default: "" },
     missionStatement: { type: String, default: "" },
    areasOfOperation: { type: [String], default: [] },
    previousProjects: { type: [String], default: [] },
    logo: { type: String, default: "" },

    setupStatus: {
      type: String,
      enum: ["details_pending", "under_review", "verified", "rejected", "banned", "suspended"],
      default: "details_pending",
    },
    actionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrgProfile", orgProfileSchema);
