import express from "express";
import {
  getCurrentUser,
  loginAdmin,
  loginStudent,
  registerAdmin,
  registerStudent,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateLogin, validateRegister } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/admin/register", validateRegister, registerAdmin);
router.post("/admin/login", validateLogin, loginAdmin);
router.post("/user/register", validateRegister, registerStudent);
router.post("/user/login", validateLogin, loginStudent);

router.post("/register", validateRegister, registerStudent);
router.post("/login", validateLogin, loginStudent);
router.get("/me", protect, getCurrentUser);

export default router;
