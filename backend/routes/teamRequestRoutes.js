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
} = require("../controllers/teamRequestController");

router.get("/me", protect, authorizeRoles("student"), getMyTeamRequest);
router.get("/me/all", protect, authorizeRoles("student"), getMyTeamRequests);
router.post("/", protect, authorizeRoles("student"), createTeamRequest);

router.get("/", protect, authorizeRoles("admin", "organizer"), listTeamRequests);
router.patch("/:id/accept", protect, authorizeRoles("admin", "organizer"), acceptTeamRequest);
router.patch("/:id/reject", protect, authorizeRoles("admin", "organizer"), rejectTeamRequest);

module.exports = router;