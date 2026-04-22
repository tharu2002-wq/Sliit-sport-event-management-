import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "dev-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const registerByRole = (role) => async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    const token = createToken(user._id);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

const loginByRole = (role) => async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      res.status(401);
      throw new Error(`Invalid credentials for ${role} role`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error(`Invalid credentials for ${role} role`);
    }



    const token = createToken(user._id);
    res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = registerByRole("Admin");
const registerStudent = registerByRole("Student");
const loginAdmin = loginByRole("Admin");
const loginStudent = loginByRole("Student");

export { registerAdmin, registerStudent, loginAdmin, loginStudent, getCurrentUser };
