import express from "express";
import {
  initiateTransaction,
  getTransactions,
  getTransaction,
  updateStatus,
  handleWebhook,
} from "../controllers/escrowController";
import { protect } from "../middleware/auth";

const router = express.Router();

router
  .route("/")
  .post(protect, initiateTransaction)
  .get(protect, getTransactions);

router.route("/:id").get(protect, getTransaction);

router.route("/:id/status").put(protect, updateStatus);

router.route("/webhook").post(handleWebhook);

export default router;
