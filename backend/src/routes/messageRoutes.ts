import express from "express";
import {
  sendMessage,
  getMessages,
  getThreads,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").post(protect, sendMessage);

router.route("/threads/all").get(protect, getThreads);

router.route("/:businessId").get(protect, getMessages);

export default router;
