import Schedule from "../models/Schedule.js";

const getSchedules = async (req, res, next) => {
  try {
    const { team, status, month } = req.query;
    const filter = {};

    if (team) {
      filter.team = team;
    }

    if (status) {
      filter.status = status;
    }

    if (month) {
      const [year, monthNumber] = month.split("-").map(Number);
      if (year && monthNumber) {
        const start = new Date(year, monthNumber - 1, 1);
        const end = new Date(year, monthNumber, 1);
        filter.scheduleDate = { $gte: start, $lt: end };
      }
    }

    const schedules = await Schedule.find(filter).sort({ scheduleDate: 1, scheduleTime: 1, createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.create({
      team: req.body.team,
      eventName: req.body.eventName,
      sportType: req.body.sportType,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      venue: req.body.venue,
      status: req.body.status,
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404);
      throw new Error("Schedule not found");
    }

    const fields = ["team", "eventName", "sportType", "scheduleDate", "scheduleTime", "venue", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        schedule[field] = req.body[field];
      }
    });

    const updated = await schedule.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      res.status(404);
      throw new Error("Schedule not found");
    }

    await schedule.deleteOne();
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { getSchedules, createSchedule, updateSchedule, deleteSchedule };
