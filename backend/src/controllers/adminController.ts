import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import Business from "../models/Business";
import EscrowTransaction from "../models/EscrowTransaction";
import { supabase } from "../config/supabase";

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeListings = await Business.countDocuments({
      status: "approved",
    });
    const pendingListings = await Business.countDocuments({
      status: "pending",
    });
    const completedDeals = await EscrowTransaction.countDocuments({
      status: "released",
    });
    const totalVolume = await EscrowTransaction.aggregate([
      { $match: { status: "released" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalListings = await Business.countDocuments();

    res.json({
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      completedDeals,
      totalVolume: totalVolume[0]?.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;

    if (!["investor", "seller", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sync with Supabase
    if (user.supabaseId) {
      const { error } = await supabase.auth.admin.updateUserById(
        user.supabaseId,
        { user_metadata: { role } }
      );

      if (error) {
        console.error("Supabase role update error:", error);
        // Continue to update local DB even if Supabase fails, or handle as needed
        // For strict sync, we might want to return error here
      }
    }

    user.role = role;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete from Supabase
    if (user.supabaseId) {
      const { error } = await supabase.auth.admin.deleteUser(user.supabaseId);
      if (error) {
        console.error("Supabase delete user error:", error);
        // Proceed with local delete or handle error
      }
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, name, phone, location, password } = req.body;

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: password || "TempPass123!", // Default temp password if not provided
        email_confirm: true,
        user_metadata: {
          role: role || "investor",
          name,
          full_name: name, // Supabase uses 'full_name' for display name
          phone,
        },
      });

    if (authError) {
      console.error("Supabase creation error:", authError);
      return res
        .status(400)
        .json({ message: `Supabase Error: ${authError.message}` });
    }

    if (!authData.user) {
      return res
        .status(500)
        .json({ message: "Failed to create Supabase user" });
    }

    // Create user in MongoDB with Supabase ID
    const user = await User.create({
      supabaseId: authData.user.id,
      email,
      role: role || "investor",
      profile: {
        name,
        phone,
        location,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Create user error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role, name, phone, location, avatarUrl, password } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sync with Supabase if email, role, or password changes
    if (user.supabaseId && (email || role || password)) {
      const updates: any = {};
      if (email) updates.email = email;
      if (password) updates.password = password;
      if (role || name) {
        updates.user_metadata = {};
        if (role) updates.user_metadata.role = role;
        if (name) {
          updates.user_metadata.name = name;
          updates.user_metadata.full_name = name;
        }
      }

      const { error } = await supabase.auth.admin.updateUserById(
        user.supabaseId,
        updates
      );

      if (error) {
        console.error("Supabase update user error:", error);
        return res
          .status(400)
          .json({ message: `Supabase Error: ${error.message}` });
      }
    }

    // Update fields
    if (email) user.email = email;
    if (role) user.role = role;
    if (name !== undefined) user.profile.name = name;
    if (phone !== undefined) user.profile.phone = phone;
    if (location !== undefined) user.profile.location = location;
    if (avatarUrl !== undefined) user.profile.avatarUrl = avatarUrl;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all listings (admin view - includes all statuses)
// @route   GET /api/admin/listings
// @access  Private (Admin)
export const getAllListings = async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Business.find()
      .populate("sellerId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending listings
// @route   GET /api/admin/listings/pending
// @access  Private (Admin)
export const getPendingListings = async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Business.find({ status: "pending" })
      .populate("sellerId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve listing
// @route   PUT /api/admin/listings/:id/approve
// @access  Private (Admin)
export const approveListing = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.status = "approved";
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject listing
// @route   PUT /api/admin/listings/:id/reject
// @access  Private (Admin)
export const rejectListing = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.status = "rejected";
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete listing (admin)
// @route   DELETE /api/admin/listings/:id
// @access  Private (Admin)
export const deleteListingAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
