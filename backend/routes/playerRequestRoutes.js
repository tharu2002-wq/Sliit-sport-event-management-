const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createPlayerRequest,
  getMyPlayerRequest,
  listPlayerRequests,
  acceptPlayerRequest,
  rejectPlayerRequest,
} = require("../controllers/playerRequestController");

router.get("/me", protect, authorizeRoles("student", "admin", "organizer"), getMyPlayerRequest);
router.post("/", protect, authorizeRoles("student", "admin", "organizer"), createPlayerRequest);

router.get("/", protect, authorizeRoles("admin", "organizer", "student"), listPlayerRequests);
router.patch("/:id/accept", protect, authorizeRoles("admin"), acceptPlayerRequest);
router.patch("/:id/reject", protect, authorizeRoles("admin"), rejectPlayerRequest);

module.exports = router;
