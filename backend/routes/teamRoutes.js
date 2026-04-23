const express = require("express");
const router = express.Router();

const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin", "organizer"), createTeam);
router.get("/", protect, getAllTeams);
router.get("/:id", protect, getTeamById);
router.put("/:id", protect, authorizeRoles("admin", "organizer"), updateTeam);
router.delete("/:id", protect, authorizeRoles("admin", "organizer"), deleteTeam);

module.exports = router;
