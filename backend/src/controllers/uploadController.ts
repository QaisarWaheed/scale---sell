import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "listings", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  } as any,
});

const upload = multer({ storage: storage });

// Export the upload middleware
export const uploadMiddleware = upload.single("image");

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
export const uploadImage = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary returns the URL in req.file.path
    res.json({ url: req.file.path });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
