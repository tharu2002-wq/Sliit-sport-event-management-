const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      required: true,
      trim: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    society: {
      type: String,
      trim: true,
      default: "Sliit",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
