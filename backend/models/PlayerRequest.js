const mongoose = require("mongoose");

const playerRequestSchema = new mongoose.Schema(
  {
    createdPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlayerRequest", playerRequestSchema);
