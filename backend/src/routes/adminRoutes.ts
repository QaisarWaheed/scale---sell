import express from "express";
import { getSystemStats } from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.route("/stats").get(protect, authorize("admin"), getSystemStats);

export default router;
