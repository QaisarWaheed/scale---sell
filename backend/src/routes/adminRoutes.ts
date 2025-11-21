import express from "express";
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  updateUser,
  getAllListings,
  getPendingListings,
  approveListing,
  rejectListing,
  deleteListingAdmin,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// System stats
router.route("/stats").get(protect, authorize("admin"), getSystemStats);

// User management
router
  .route("/users")
  .get(protect, authorize("admin"), getAllUsers)
  .post(protect, authorize("admin"), createUser);

router
  .route("/users/:id")
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

router
  .route("/users/:id/role")
  .put(protect, authorize("admin"), updateUserRole);

// Listing management
router.route("/listings").get(protect, authorize("admin"), getAllListings);

router
  .route("/listings/pending")
  .get(protect, authorize("admin"), getPendingListings);

router
  .route("/listings/:id/approve")
  .put(protect, authorize("admin"), approveListing);

router
  .route("/listings/:id/reject")
  .put(protect, authorize("admin"), rejectListing);

router
  .route("/listings/:id")
  .delete(protect, authorize("admin"), deleteListingAdmin);

export default router;
