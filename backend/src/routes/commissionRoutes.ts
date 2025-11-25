import express from "express";
import { protect } from "../middleware/auth";
import {
  getTotalCommissions,
  getCommissionStats,
  getCommissionsByPeriod,
  getCommissionDetails,
  getAllCommissions,
} from "../controllers/commissionController";

const router = express.Router();

// All routes require authentication (admin only, enforced in controller)
router.use(protect);

// Commission endpoints
router.get("/total", getTotalCommissions);
router.get("/stats", getCommissionStats);
router.get("/period", getCommissionsByPeriod);
router.get("/:id", getCommissionDetails);
router.get("/", getAllCommissions);

export default router;
