import express from "express";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../controllers/memberController.js";
import {
  validateCreateMember,
  validateIdParam,
  validateMemberListQuery,
  validateUpdateMember,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").get(validateMemberListQuery, getMembers).post(validateCreateMember, createMember);
router.route("/:id").put(validateIdParam, validateUpdateMember, updateMember).delete(validateIdParam, deleteMember);

export default router;
