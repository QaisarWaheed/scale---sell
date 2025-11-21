import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";
import Business from "../models/Business";
import EscrowTransaction from "../models/EscrowTransaction";

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

    res.json({
      totalUsers,
      activeListings,
      pendingListings,
      completedDeals,
      totalVolume: totalVolume[0]?.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
