import express from "express";
import { uploadImage, uploadMiddleware } from "../controllers/uploadController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, uploadMiddleware, uploadImage);

export default router;
