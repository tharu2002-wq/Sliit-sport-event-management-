const Team = require("../models/Team");
const Player = require("../models/Player");

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Admin, Organizer)
const createTeam = async (req, res) => {
  try {
    const { teamName, sportType, society, contactEmail, contactPhone, captain, members } = req.body;

    if (!teamName || !sportType || !society || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!/^\d{10}$/.test(contactPhone.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ message: "Contact number must be exactly 10 digits" });
    }

    const memberIds = Array.isArray(members) ? members : [];

    if (captain) {
      const captainExists = await Player.findById(captain);
      if (!captainExists) {
        return res.status(404).json({ message: "Captain player not found" });
      }
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ teamName: String(teamName).trim() });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    if (memberIds.length > 0) {
      const count = await Player.countDocuments({ _id: { $in: memberIds } });
      if (count !== memberIds.length) {
        return res.status(404).json({ message: "One or more members not found" });
      }

      // Check if any member is already in an active team
      const activeTeamsWithMembers = await Team.find({
        members: { $in: memberIds },
        isActive: { $ne: false }
      }).lean();

      if (activeTeamsWithMembers.length > 0) {
        return res.status(400).json({ 
          message: "One or more selected players are already assigned to an active team" 
        });
      }
    }

    const team = await Team.create({
      teamName: String(teamName).trim(),
      sportType: String(sportType).trim(),
      society: society ? String(society).trim() : "Sliit",
      contactEmail: contactEmail ? String(contactEmail).trim().toLowerCase() : undefined,
      contactPhone: contactPhone ? String(contactPhone).trim() : undefined,
      captain: captain || null,
      members: memberIds,
    });

    const populated = await Team.findById(team._id)
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email")
      .sort({ createdAt: -1 });

    return res.status(200).json(teams);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get team by id
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json(team);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Organizer)
const updateTeam = async (req, res) => {
  try {
    const { teamName, sportType, society, contactEmail, contactPhone, captain, members, isActive } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (captain !== undefined && captain !== null) {
      const captainExists = await Player.findById(captain);
      if (!captainExists) {
        return res.status(404).json({ message: "Captain player not found" });
      }
    }

    if (members !== undefined) {
      const memberIds = Array.isArray(members) ? members : [];
      if (memberIds.length > 0) {
        const count = await Player.countDocuments({ _id: { $in: memberIds } });
        if (count !== memberIds.length) {
          return res.status(404).json({ message: "One or more members not found" });
        }
      }
      team.members = memberIds;
    }

    if (teamName !== undefined) team.teamName = String(teamName).trim();
    if (sportType !== undefined) team.sportType = String(sportType).trim();
    if (society !== undefined) team.society = String(society).trim();
    if (contactEmail !== undefined) team.contactEmail = contactEmail ? String(contactEmail).trim().toLowerCase() : undefined;
    if (contactPhone !== undefined) team.contactPhone = contactPhone ? String(contactPhone).trim() : undefined;
    if (captain !== undefined) team.captain = captain || null;
    if (isActive !== undefined) team.isActive = Boolean(isActive);

    await team.save();

    const populated = await Team.findById(team._id)
      .populate("captain", "fullName studentId email")
      .populate("members", "fullName studentId email");

    return res.status(200).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin, Organizer)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    await Team.findByIdAndDelete(req.params.id);
    await Player.updateMany(
      { team: req.params.id },
      { $set: { team: null } }
    );
    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};
