import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const scheduleSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    sportType: {
      type: String,
      default: "General",
      trim: true,
    },
    scheduleDate: {
      type: Date,
      required: true,
    },
    scheduleTime: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }
          return timePattern.test(value);
        },
        message: "Schedule time must be in HH:mm format.",
      },
    },
    venue: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Planned", "Completed", "Cancelled"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
