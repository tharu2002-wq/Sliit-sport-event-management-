import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
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
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["President", "Secretary", "Treasurer", "Member", "Coordinator"],
      default: "Member",
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
