import express from "express";
import {
  initiateTransaction,
  updateStatus,
  getTransactions,
} from "../controllers/escrowController";
import { protect } from "../middleware/auth";

const router = express.Router();

router
  .route("/")
  .get(protect, getTransactions)
  .post(protect, initiateTransaction);

router.route("/:id/status").put(protect, updateStatus);

export default router;
