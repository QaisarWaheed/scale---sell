import express from "express";
import {
  sendMessage,
  getMessages,
  getThreads,
  getMessagesByBusiness,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").post(protect, sendMessage);

router.route("/threads/all").get(protect, getThreads);

router.route("/thread/:threadId").get(protect, getMessages);

// Legacy route for backward compatibility
router.route("/:businessId").get(protect, getMessagesByBusiness);

export default router;
