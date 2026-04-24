const express = require("express");
const router = express.Router();
console.log("Team request routes file initialized");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createTeamRequest,
  getMyTeamRequest,
  getMyTeamRequests,
  listTeamRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  updateTeamRequest,
} = require("../controllers/teamRequestController");

router.get("/me", protect, authorizeRoles("student", "admin", "organizer"), getMyTeamRequest);
router.get("/me/all", protect, authorizeRoles("student", "admin", "organizer"), getMyTeamRequests);
router.post("/", protect, authorizeRoles("student", "admin", "organizer"), createTeamRequest);
router.get("/:id", protect, authorizeRoles("student", "admin", "organizer"), async (req, res) => {
  const TeamRequest = require("../models/TeamRequest");
  const request = await TeamRequest.findById(req.params.id).populate("captain members").lean();
  if (!request) return res.status(404).json({ message: "Not found in debug get" });
  res.json(request);
});
router.patch("/:id", protect, authorizeRoles("student", "admin", "organizer"), updateTeamRequest);
router.put("/:id", protect, authorizeRoles("student", "admin", "organizer"), updateTeamRequest);

router.get("/", protect, authorizeRoles("admin", "organizer", "student"), listTeamRequests);
router.patch("/:id/accept", protect, authorizeRoles("admin", "organizer"), acceptTeamRequest);
router.patch("/:id/reject", protect, authorizeRoles("admin", "organizer"), rejectTeamRequest);

router.get("/debug/bhsk", async (req, res) => {
  const TeamRequest = require("../models/TeamRequest");
  const request = await TeamRequest.findOne({ teamName: "bhsk" }).populate("captain").lean();
  res.json(request);
});

module.exports = router;