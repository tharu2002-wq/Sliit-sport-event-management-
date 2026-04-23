import Member from "../models/Member.js";
import Society from "../models/Society.js";
import generateId from "../utils/generateId.js";

const syncMemberCount = async (societyId) => {
  const count = await Member.countDocuments({ society: societyId });
  await Society.findByIdAndUpdate(societyId, { membersCount: count });
};

const getMembers = async (req, res, next) => {
  try {
    const filter = req.query.societyId ? { society: req.query.societyId } : {};
    const members = await Member.find(filter).populate("society", "name customId").sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const society = await Society.findById(req.body.society);

    if (!society) {
      res.status(404);
      throw new Error("Selected society not found");
    }

    const member = await Member.create({
      customId: generateId("MEM"),
      society: req.body.society,
      fullName: req.body.fullName,
      role: req.body.role,
      email: req.body.email,
      phone: req.body.phone,
      joinedOn: req.body.joinedOn,
    });

    await syncMemberCount(req.body.society);

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    if (req.body.society !== undefined && req.body.society !== member.society.toString()) {
      const society = await Society.findById(req.body.society);
      if (!society) {
        res.status(404);
        throw new Error("Selected society not found");
      }
    }

    const previousSociety = member.society.toString();

    const fields = ["society", "fullName", "role", "email", "phone", "joinedOn"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        member[field] = req.body[field];
      }
    });

    await member.save();

    await syncMemberCount(previousSociety);
    await syncMemberCount(member.society);

    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }

    const societyId = member.society;
    await member.deleteOne();
    await syncMemberCount(societyId);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { getMembers, createMember, updateMember, deleteMember };
