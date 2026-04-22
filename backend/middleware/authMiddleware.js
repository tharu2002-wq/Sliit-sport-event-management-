import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-key");
    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(401);
    }
    next(error);
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  if (!roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error("Forbidden: insufficient permissions"));
  }

  next();
};

export { protect, authorizeRoles };
