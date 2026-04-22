import express from "express";
import {
  createSociety,
  deleteSociety,
  getNextSocietyCode,
  getSocieties,
  getSocietyById,
  updateSociety,
} from "../controllers/societyController.js";
import {
  validateCreateSociety,
  validateIdParam,
  validateSocietyListQuery,
  validateUpdateSociety,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.route("/").get(validateSocietyListQuery, getSocieties).post(validateCreateSociety, createSociety);
router.get("/next-code", getNextSocietyCode);
router
  .route("/:id")
  .get(validateIdParam, getSocietyById)
  .put(validateIdParam, validateUpdateSociety, updateSociety)
  .delete(validateIdParam, deleteSociety);

export default router;
