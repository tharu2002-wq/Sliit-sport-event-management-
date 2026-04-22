import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Sports", "Technical", "Cultural", "Community", "Other"],
      default: "Other",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    establishedYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    president: {
      type: String,
      default: "",
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    membersCount: {
      type: Number,
      default: 0,
    },
    teamCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Society = mongoose.model("Society", societySchema);

export default Society;
