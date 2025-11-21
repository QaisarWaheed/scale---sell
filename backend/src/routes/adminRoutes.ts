import express from "express";
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.route("/stats").get(protect, authorize("admin"), getSystemStats);
router.route("/users").get(protect, authorize("admin"), getAllUsers);
router
  .route("/users/:id/role")
  .put(protect, authorize("admin"), updateUserRole);
router.route("/users/:id").delete(protect, authorize("admin"), deleteUser);

export default router;
