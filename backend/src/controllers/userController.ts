import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (user) {
    user.profile.name = req.body.name || user.profile.name;
    user.profile.phone = req.body.phone || user.profile.phone;
    user.profile.location = req.body.location || user.profile.location;
    user.profile.avatarUrl = req.body.avatarUrl || user.profile.avatarUrl;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
