import Society from "../models/Society.js";
import Member from "../models/Member.js";
import Team from "../models/Team.js";

const getNextSocietyCodeValue = async () => {
  const societies = await Society.find({ customId: /^SOC\d+$/ }).select("customId").lean();

  let maxSequence = 0;
  societies.forEach((item) => {
    const parsed = Number.parseInt(item.customId.replace("SOC", ""), 10);
    if (!Number.isNaN(parsed) && parsed > maxSequence) {
      maxSequence = parsed;
    }
  });

  const nextSequence = maxSequence + 1;
  return `SOC${String(nextSequence).padStart(3, "0")}`;
};

const getNextSocietyCode = async (req, res, next) => {
  try {
    const code = await getNextSocietyCodeValue();
    res.status(200).json({ code });
  } catch (error) {
    next(error);
  }
};

const getSocieties = async (req, res, next) => {
  try {
    const { q, type } = req.query;
    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (type) {
      filter.type = type;
    }

    const societies = await Society.find(filter).sort({ createdAt: -1 });
    res.status(200).json(societies);
  } catch (error) {
    next(error);
  }
};

const getSocietyById = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id);

    if (!society) {
      res.status(404);
      throw new Error("Society not found");
    }

    const [members, teams] = await Promise.all([
      Member.find({ society: society._id }).sort({ createdAt: -1 }),
      Team.find({ society: society._id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({ society, members, teams });
  } catch (error) {
    next(error);
  }
};

const createSociety = async (req, res, next) => {
  try {
    const nextCode = await getNextSocietyCodeValue();

    const society = await Society.create({
      customId: nextCode,
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      establishedYear: req.body.establishedYear,
      president: req.body.president,
      contactEmail: req.body.contactEmail,
      phone: req.body.phone,
      status: req.body.status,
    });

    res.status(201).json(society);
  } catch (error) {
    next(error);
  }
};

const updateSociety = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id);

    if (!society) {
      res.status(404);
      throw new Error("Society not found");
    }

    const fields = [
      "name",
      "type",
      "description",
      "establishedYear",
      "president",
      "contactEmail",
      "phone",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        society[field] = req.body[field];
      }
    });

    const updated = await society.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteSociety = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id);

    if (!society) {
      res.status(404);
      throw new Error("Society not found");
    }

    await Promise.all([
      Member.deleteMany({ society: society._id }),
      Team.deleteMany({ society: society._id }),
      society.deleteOne(),
    ]);

    res.status(200).json({ message: "Society deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { getSocieties, getSocietyById, getNextSocietyCode, createSociety, updateSociety, deleteSociety };
