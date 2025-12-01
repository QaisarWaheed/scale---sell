import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Commission from "../models/Commission";
import EscrowTransaction from "../models/EscrowTransaction";

// @desc    Get total commissions
// @route   GET /api/commissions/total
// @access  Private (Admin)
export const getTotalCommissions = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const result = await Commission.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: {
            $sum: { $cond: [{ $eq: ["$status", "collected"] }, "$amount", 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
          },
          totalAll: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = result[0] || {
      totalCollected: 0,
      totalPending: 0,
      totalAll: 0,
      count: 0,
    };

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get commission statistics
// @route   GET /api/commissions/stats
// @access  Private (Admin)
export const getCommissionStats = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Get stats by transaction type
    const typeStats = await Commission.aggregate([
      {
        $group: {
          _id: "$transactionType",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      byType: typeStats,
      monthly: monthlyStats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get commissions by period
// @route   GET /api/commissions/period?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access  Private (Admin)
export const getCommissionsByPeriod = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const commissions = await Commission.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("buyerId", "email profile.name")
      .populate("sellerId", "email profile.name")
      .populate("businessId", "title")
      .sort({ createdAt: -1 });

    res.json(commissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get commission details by ID
// @route   GET /api/commissions/:id
// @access  Private (Admin)
export const getCommissionDetails = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const commission = await Commission.findById(req.params.id)
      .populate("transactionId")
      .populate("buyerId", "email profile")
      .populate("sellerId", "email profile")
      .populate("businessId", "title financials");

    if (!commission) {
      return res.status(404).json({ message: "Commission not found" });
    }

    res.json(commission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all commissions (with pagination)
// @route   GET /api/commissions
// @access  Private (Admin)
export const getAllCommissions = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    if (authReq.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const commissions = await Commission.find()
      .populate("buyerId", "email profile.name")
      .populate("sellerId", "email profile.name")
      .populate("businessId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Commission.countDocuments();

    res.json({
      commissions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
