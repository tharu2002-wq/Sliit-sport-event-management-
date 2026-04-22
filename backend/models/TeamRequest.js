const mongoose = require("mongoose");

const teamRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamName: { type: String, required: true, trim: true },
    sportType: { type: String, required: true, trim: true },
    society: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    rejectReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

teamRequestSchema.index({ user: 1, status: 1 });
teamRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("TeamRequest", teamRequestSchema);