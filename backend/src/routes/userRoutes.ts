import express from "express";
import {
  getProfile,
  updateProfile,
  switchRole,
} from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/profile").get(protect, getProfile).put(protect, updateProfile);
router.route("/role").put(protect, switchRole);

export default router;
