import express from "express";
import { createSchedule, deleteSchedule, getSchedules, updateSchedule } from "../controllers/scheduleController.js";
import {
	validateCreateSchedule,
	validateIdParam,
	validateScheduleListQuery,
	validateUpdateSchedule,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").get(validateScheduleListQuery, getSchedules).post(validateCreateSchedule, createSchedule);
router.route("/:id").put(validateIdParam, validateUpdateSchedule, updateSchedule).delete(validateIdParam, deleteSchedule);

export default router;
