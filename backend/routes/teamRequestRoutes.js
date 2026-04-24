const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createTeamRequest,
  getMyTeamRequest,
  getMyTeamRequests,
  listTeamRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  updateTeamRequest,
  deleteTeamRequest,
} = require("../controllers/teamRequestController");

router.get("/me", protect, authorizeRoles("student", "admin", "organizer"), getMyTeamRequest);
router.get("/me/all", protect, authorizeRoles("student", "admin", "organizer"), getMyTeamRequests);
router.post("/", protect, authorizeRoles("student", "admin", "organizer"), createTeamRequest);
router.delete("/:id", protect, authorizeRoles("student", "admin", "organizer"), deleteTeamRequest);
router.patch("/:id", protect, authorizeRoles("student", "admin", "organizer"), updateTeamRequest);
router.put("/:id", protect, authorizeRoles("student", "admin", "organizer"), updateTeamRequest);

router.get("/", protect, authorizeRoles("admin", "organizer"), listTeamRequests);
router.patch("/:id/accept", protect, authorizeRoles("admin", "organizer"), acceptTeamRequest);
router.patch("/:id/reject", protect, authorizeRoles("admin", "organizer"), rejectTeamRequest);

module.exports = router;