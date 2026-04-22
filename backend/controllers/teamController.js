import Team from "../models/Team.js";
import Society from "../models/Society.js";
import generateId from "../utils/generateId.js";

const syncTeamCount = async (societyId) => {
  const count = await Team.countDocuments({ society: societyId });
  await Society.findByIdAndUpdate(societyId, { teamCount: count });
};

const normalizeMemberKey = (value) => String(value || "").trim().toLowerCase();

const normalizeMembers = (members) => {
  if (!Array.isArray(members)) {
    return [];
  }

  const normalized = members
    .map((member) => String(member || "").trim())
    .filter(Boolean);

  return [...new Set(normalized)];
};



const getTeams = async (req, res, next) => {
  try {
    const filter = req.query.societyId ? { society: req.query.societyId } : {};
    const teams = await Team.find(filter).populate("society", "name customId").sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

const getMyTeamRequests = async (req, res, next) => {
  try {
    const teams = await Team.find({ createdBy: req.user._id })
      .populate("society", "name customId")
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const society = await Society.findById(req.body.society);
    const captainName = req.body.captain ?? req.body.coach ?? "";
    const coachName = req.body.coach ?? req.body.captain ?? "";
    const normalizedMembers = normalizeMembers(req.body.members);

    if (!society) {
      res.status(404);
      throw new Error("Selected society not found");
    }

    const isStudent = req.user?.role === "Student";



    const team = await Team.create({
      customId: generateId("TEAM"),
      society: req.body.society,
      name: req.body.name,
      category: req.body.category,
      captain: captainName,
      photoUrl: req.body.photoUrl,
      coach: coachName,
      members: normalizedMembers,
      achievements: req.body.achievements || [],
      status: isStudent ? "pending" : req.body.status || "pending",
      rejectionReason: "",
      adminMessage: "",
      contactEmail: req.body.contactEmail || "",
      contactPhone: req.body.contactPhone || "",
      createdBy: req.user?._id || null,
    });

    await syncTeamCount(req.body.society);

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    const isStudent = req.user?.role === "Student";
    const isAdmin = req.user?.role === "Admin";

    if (isStudent) {
      const ownsTeam = team.createdBy && team.createdBy.toString() === req.user._id.toString();
      if (!ownsTeam) {
        res.status(403);
        throw new Error("You can only update your own team requests");
      }

      if (team.status === "active") {
        res.status(400);
        throw new Error("Approved teams cannot be edited by students");
      }
    }

    if (!isAdmin && req.body.status !== undefined) {
      delete req.body.status;
    }

    if (req.body.society !== undefined && req.body.society !== team.society.toString()) {
      const society = await Society.findById(req.body.society);
      if (!society) {
        res.status(404);
        throw new Error("Selected society not found");
      }
    }

    const previousSociety = team.society.toString();

    if (req.body.members !== undefined) {
      const normalizedMembers = normalizeMembers(req.body.members);

      req.body.members = normalizedMembers;
    }

    const fields = ["society", "name", "category", "captain", "coach", "photoUrl", "members", "achievements", "status", "rejectionReason", "contactEmail", "contactPhone"];


    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        team[field] = req.body[field];
      }
    });

    if (isStudent) {
      team.status = "pending";
      team.rejectionReason = "";
      team.adminMessage = "";
      team.reviewedBy = null;
      team.reviewedAt = null;
    }

    if (req.body.captain !== undefined) {
      team.captain = req.body.captain;
    } else if (req.body.coach !== undefined) {
      team.coach = req.body.coach;
    }

    await team.save();

    await syncTeamCount(previousSociety);
    await syncTeamCount(team.society);

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

const reviewTeamRequest = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    const { status, adminMessage = "" } = req.body;
    const message = String(adminMessage).trim();

    team.status = status;
    team.adminMessage = message;
    team.reviewedBy = req.user._id;
    team.reviewedAt = new Date();

    if (status === "rejected") {
      team.rejectionReason = message;
    } else {
      team.rejectionReason = "";
    }

    await team.save();

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    const societyId = team.society;
    await team.deleteOne();
    await syncTeamCount(societyId);

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { getTeams, getMyTeamRequests, createTeam, updateTeam, reviewTeamRequest, deleteTeam };
