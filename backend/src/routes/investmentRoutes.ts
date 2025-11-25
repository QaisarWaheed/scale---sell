import express from "express";
import { protect } from "../middleware/auth";
import {
  createInvestment,
  getInvestmentsByInvestor,
  getInvestmentsBySeller,
  getActiveInvestments,
  approveInvestment,
  rejectInvestment,
  withdrawInvestment,
  getInvestment,
} from "../controllers/investmentController";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create investment offer
router.post("/", createInvestment);

// Get investments by role
router.get("/investor", getInvestmentsByInvestor);
router.get("/seller", getInvestmentsBySeller);
router.get("/active", getActiveInvestments);

// Investment actions
router.put("/:id/approve", approveInvestment);
router.put("/:id/reject", rejectInvestment);
router.put("/:id/withdraw", withdrawInvestment);

// Get single investment
router.get("/:id", getInvestment);

export default router;
