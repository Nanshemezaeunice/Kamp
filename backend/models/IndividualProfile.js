// Profile for individual supporters and advocates.
// Extends the User record with personal interests, setup status and bio.
const mongoose = require("mongoose");

const individualProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: { type: String, default: "" },
    interest: {
      type: String,
      enum: [
        "Donating",
        "Volunteering",
        "Advocacy",
        "Research",
        "Community Monitoring",
        "Other",
      ],
      default: "Donating",
    },

    // Detailed Info (Step 2 - setup page)
    location: { type: String, default: "" },
    occupation: { type: String, default: "" },
    bio: { type: String, default: "" },
    areasOfInterest: { type: [String], default: [] },
    howHeard: { type: String, default: "" },
    image: { type: String, default: "" },

    setupStatus: {
      type: String,
      enum: ["details_pending", "under_review", "verified", "rejected", "banned", "suspended"],
      default: "details_pending",
    },
    actionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IndividualProfile", individualProfileSchema);
