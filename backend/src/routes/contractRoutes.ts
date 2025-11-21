import express from "express";
import {
  createContract,
  signContract,
  getContract,
} from "../controllers/contractController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").post(protect, createContract);

router.route("/:id/sign").put(protect, signContract);

router.route("/:transactionId").get(protect, getContract);

export default router;
