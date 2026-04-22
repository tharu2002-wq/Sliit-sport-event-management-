import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    captain: {
      type: String,
      default: "",
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    coach: {
      type: String,
      default: "",
      trim: true,
    },
    members: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    adminMessage: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
