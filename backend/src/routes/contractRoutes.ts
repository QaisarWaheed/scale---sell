import express from "express";
import {
  createContract,
  signContract,
  getContract,
  getUserContracts,
  adminApproveContract,
  getAllContracts,
} from "../controllers/contractController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").post(protect, createContract);

router.route("/all").get(protect, getAllContracts);

router.route("/user/all").get(protect, getUserContracts);

router.route("/:id/sign").put(protect, signContract);

router.route("/:id/admin/approve").put(protect, adminApproveContract);

router.route("/:transactionId").get(protect, getContract);

export default router;
