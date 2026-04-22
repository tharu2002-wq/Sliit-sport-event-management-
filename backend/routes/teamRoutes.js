import express from "express";
import {
	createTeam,
	deleteTeam,
	getMyTeamRequests,
	getTeams,
	reviewTeamRequest,
	updateTeam,
} from "../controllers/teamController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import {
	validateCreateTeam,
	validateIdParam,
	validateTeamReview,
	validateTeamListQuery,
	validateUpdateTeam,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").get(validateTeamListQuery, getTeams).post(protect, validateCreateTeam, createTeam);
router.route("/my-requests").get(protect, authorizeRoles("Student"), getMyTeamRequests);
router
	.route("/:id/review")
	.patch(protect, authorizeRoles("Admin"), validateIdParam, validateTeamReview, reviewTeamRequest);
router
	.route("/:id")
	.put(protect, validateIdParam, validateUpdateTeam, updateTeam)
	.delete(protect, authorizeRoles("Admin"), validateIdParam, deleteTeam);

export default router;
