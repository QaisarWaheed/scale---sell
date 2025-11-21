import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} from "../controllers/listingController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router
  .route("/")
  .get(getListings)
  .post(protect, authorize("seller", "admin"), createListing);

router.route("/my-listings").get(protect, authorize("seller"), getMyListings);

router
  .route("/:id")
  .get(getListingById)
  .put(protect, authorize("seller", "admin"), updateListing)
  .delete(protect, authorize("seller", "admin"), deleteListing);

export default router;
