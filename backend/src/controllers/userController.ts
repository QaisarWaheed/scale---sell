import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import "../models/Listing"; // Ensure Listing model is registered

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

// @desc    Toggle saved listing
// @route   POST /api/users/saved-listings/:id
// @access  Private
export const toggleSavedListing = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    const listingId = req.params.id;

    if (user) {
      // Initialize savedListings if it doesn't exist
      if (!user.savedListings) {
        user.savedListings = [];
      }

      // Check if listing is already saved
      // @ts-ignore
      const index = user.savedListings.indexOf(listingId);

      if (index > -1) {
        // Remove from saved
        user.savedListings.splice(index, 1);
      } else {
        // Add to saved
        // @ts-ignore
        user.savedListings.push(listingId);
      }

      await user.save();
      res.json(user.savedListings);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in toggleSavedListing:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get saved listings
// @route   GET /api/users/saved-listings
// @access  Private
export const getSavedListings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate("savedListings");

    if (user) {
      // Ensure savedListings is an array and filter out nulls (deleted listings)
      const validListings = (user.savedListings || []).filter(
        (listing) => listing !== null
      );
      res.json(validListings);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in getSavedListings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
