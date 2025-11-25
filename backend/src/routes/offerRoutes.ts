import express from "express";
import {
  createOffer,
  getOffersByBuyer,
  getOffersBySeller,
  approveOffer,
  rejectOffer,
  withdrawOffer,
} from "../controllers/offerController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").post(protect, createOffer);
router.route("/buyer").get(protect, getOffersByBuyer);
router.route("/seller").get(protect, getOffersBySeller);
router.route("/:id/approve").put(protect, approveOffer);
router.route("/:id/reject").put(protect, rejectOffer);
router.route("/:id/withdraw").put(protect, withdrawOffer);

export default router;
