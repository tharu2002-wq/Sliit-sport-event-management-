const Team = require("../models/Team");
const TeamRequest = require("../models/TeamRequest");
const Player = require("../models/Player");
const User = require("../models/User");

function normalizeIdList(ids) {
  return [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id).trim()).filter(Boolean))];
}

async function findPlayersAlreadyInOtherTeams(memberIds, excludedTeamId = null) {
  if (!memberIds.length) return new Map();

  const query = { members: { $in: memberIds }, isActive: { $ne: false } };
  if (excludedTeamId) {
    query._id = { $ne: excludedTeamId };
  }

  const teamsWithMembers = await Team.find(query).select("teamName members").lean();
  const conflicts = new Map();

  for (const team of teamsWithMembers) {
    for (const memberId of team.members || []) {
      const id = memberId.toString();
      if (!memberIds.includes(id)) continue;
      if (!conflicts.has(id)) {
        conflicts.set(id, team.teamName || "another team");
      }
    }
  }

  return conflicts;
}

async function validateTeamRequestPayload(payload, options = {}) {
  const { enforceTeamConflicts = true } = options;
  const { teamName, sportType, society, contactEmail, contactPhone, captain, members } = payload;

  if (!teamName || !sportType || !society || !contactEmail || !contactPhone) {
    return { message: "All fields are required" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { message: "Please provide a valid email address" };
  }

  if (!/^\d{10}$/.test(contactPhone.replace(/[-\s]/g, ''))) {
    return { message: "Contact number must be exactly 10 digits" };
  }

  const normalizedMembers = normalizeIdList(members);
  const captainId = String(captain || "").trim();
  if (!captainId) {
    return { message: "Captain is required" };
  }

  if (normalizedMembers.length === 0) {
    return { message: "Select at least one player" };
  }

  if (!normalizedMembers.includes(captainId)) {
    normalizedMembers.push(captainId);
  }

  const foundPlayers = await Player.find({ _id: { $in: normalizedMembers } });
  if (foundPlayers.length !== normalizedMembers.length) {
    return { message: "One or more member IDs are invalid" };
  }

  if (enforceTeamConflicts) {
    const conflicts = await findPlayersAlreadyInOtherTeams(normalizedMembers);
    if (conflicts.size > 0) {
      return {
        message: "One or more players are already assigned to another team",
        conflicts: Object.fromEntries(conflicts),
      };
    }
  }

  return {
    normalizedMembers,
    captainId,
    payload: {
      teamName: String(teamName).trim(),
      sportType: String(sportType).trim(),
      society: String(society).trim(),
      contactEmail: contactEmail != null ? String(contactEmail).trim().toLowerCase() : undefined,
      contactPhone: contactPhone != null ? String(contactPhone).trim() : undefined,
    },
  };
}

/**
 * @desc    Student submits a request to create a team
 * @route   POST /api/team-requests
 * @access  Private (student)
 */
const createTeamRequest = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit a team request." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeRequest = await TeamRequest.findOne({
      user: user._id,
      status: "pending",
    });
    if (activeRequest) {
      return res.status(400).json({ message: "You already have an active team request." });
    }

    const validation = await validateTeamRequestPayload(req.body, { enforceTeamConflicts: false });
    if (validation.message) {
      return res.status(400).json({ message: validation.message, conflicts: validation.conflicts });
    }

    const doc = await TeamRequest.create({
      user: user._id,
      teamName: validation.payload.teamName,
      sportType: validation.payload.sportType,
      society: validation.payload.society,
      contactEmail: validation.payload.contactEmail,
      contactPhone: validation.payload.contactPhone,
      captain: validation.captainId,
      members: validation.normalizedMembers,
      status: "pending",
    });

    const populated = await TeamRequest.findById(doc._id)
      .populate("user", "name email role")
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .lean();

    return res.status(201).json({ message: "Request submitted", request: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Latest team request for the current student
 * @route   GET /api/team-requests/me
 * @access  Private (student)
 */
const getMyTeamRequest = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const request = await TeamRequest.findOne({ user: req.user._id })
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ request: request ?? null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    All team requests for the current student
 * @route   GET /api/team-requests/me/all
 * @access  Private (student)
 */
const getMyTeamRequests = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const requests = await TeamRequest.find({ user: req.user._id })
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    List team requests (admin)
 * @route   GET /api/team-requests
 * @access  Private (admin)
 */
const listTeamRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const list = await TeamRequest.find(filter)
      .populate("user", "name email role studentId")
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve a pending team request and create a team
 * @route   PATCH /api/team-requests/:id/accept
 * @access  Private (admin)
 */
const acceptTeamRequest = async (req, res) => {
  try {
    const request = await TeamRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request is not pending" });
    }

    const validation = await validateTeamRequestPayload({
      teamName: req.body.teamName || request.teamName,
      sportType: req.body.sportType || request.sportType,
      society: req.body.society || request.society,
      contactEmail: req.body.contactEmail ?? request.contactEmail,
      contactPhone: req.body.contactPhone ?? request.contactPhone,
      captain: req.body.captain || request.captain,
      members: req.body.members || request.members,
    }, { enforceTeamConflicts: true });

    if (validation.message) {
      return res.status(400).json({ message: validation.message, conflicts: validation.conflicts });
    }

    const existingTeam = await Team.findOne({ teamName: validation.payload.teamName });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    const team = await Team.create({
      teamName: validation.payload.teamName,
      sportType: validation.payload.sportType,
      society: validation.payload.society,
      contactEmail: validation.payload.contactEmail,
      contactPhone: validation.payload.contactPhone,
      captain: validation.captainId,
      members: validation.normalizedMembers,
    });

    request.status = "approved";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.createdTeam = team._id;
    request.rejectReason = "";
    await request.save();

    return res.status(200).json({
      message: "Team created from request",
      team,
      request: await TeamRequest.findById(request._id).lean(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject a pending team request
 * @route   PATCH /api/team-requests/:id/reject
 * @access  Private (admin)
 */
const rejectTeamRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await TeamRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request is not pending" });
    }

    request.status = "rejected";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    request.rejectReason = reason != null ? String(reason).trim().slice(0, 500) : "";
    await request.save();

    return res.status(200).json({ message: "Request rejected", request: await TeamRequest.findById(request._id).lean() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeamRequest,
  getMyTeamRequest,
  getMyTeamRequests,
  listTeamRequests,
  acceptTeamRequest,
  rejectTeamRequest,
};