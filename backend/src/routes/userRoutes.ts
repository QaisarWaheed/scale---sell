import express from "express";
import {
  getProfile,
  updateProfile,
  toggleSavedListing,
  getSavedListings,
} from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/profile").get(protect, getProfile).put(protect, updateProfile);

router.route("/saved-listings").get(protect, getSavedListings);

router.route("/saved-listings/:id").post(protect, toggleSavedListing);

export default router;
