import express from "express";
import {
  sendMessage,
  getMessages,
  getThreads,
  getMessagesByBusiness,
  startConversation,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/threads/all").get(protect, getThreads);

router.route("/start-conversation").post(protect, startConversation);
router.route("/thread/:threadId").get(protect, getMessages);

router.route("/").post(protect, sendMessage);

router.route("/:businessId").get(protect, getMessagesByBusiness);

export default router;
