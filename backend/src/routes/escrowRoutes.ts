import express from "express";
import {
  initiateTransaction,
  updateStatus,
  getTransactions,
  getTransaction,
  handleWebhook,
} from "../controllers/escrowController";
import { protect } from "../middleware/auth";

const router = express.Router();

router
  .route("/")
  .get(protect, getTransactions)
  .post(protect, initiateTransaction);

router.route("/:id").get(protect, getTransaction);

router.route("/:id/status").put(protect, updateStatus);

// Webhook endpoint (no auth, verified by signature)
router.post("/webhook", handleWebhook);

export default router;
