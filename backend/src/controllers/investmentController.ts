import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Investment from "../models/Investment";
import Business from "../models/Business";
import Listing from "../models/Listing";
import EscrowTransaction from "../models/EscrowTransaction";
import Commission from "../models/Commission";
import mongoose from "mongoose";

const COMMISSION_RATE = 0.05; // 5% commission

// @desc    Create a new investment offer
// @route   POST /api/investments
// @access  Private (Investor)
export const createInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      businessId,
      investmentAmount,
      investmentType,
      equityPercentage,
      revenueSharePercentage,
      terms,
      message,
    } = req.body;
    const investorId = req.user?._id;

    if (!investorId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify business exists and accepts investments
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Get the listing to check investment options
    const listing = await Listing.findOne({ _id: businessId });
    if (
      listing &&
      listing.listingType !== "investment" &&
      listing.listingType !== "both"
    ) {
      return res.status(400).json({
        message: "This business is not seeking investments",
      });
    }

    // Validate investment amount against listing constraints
    if (listing?.investmentOptions?.minInvestment) {
      if (investmentAmount < listing.investmentOptions.minInvestment) {
        return res.status(400).json({
          message: `Minimum investment is ${listing.investmentOptions.minInvestment}`,
        });
      }
    }

    if (listing?.investmentOptions?.maxInvestment) {
      if (investmentAmount > listing.investmentOptions.maxInvestment) {
        return res.status(400).json({
          message: `Maximum investment is ${listing.investmentOptions.maxInvestment}`,
        });
      }
    }

    // Check for existing pending investment
    const existingInvestment = await Investment.findOne({
      investorId,
      businessId,
      status: "pending",
    });

    if (existingInvestment) {
      return res.status(400).json({
        message: "You already have a pending investment for this business",
      });
    }

    const investment = await Investment.create({
      investorId,
      sellerId: business.sellerId,
      businessId,
      investmentAmount,
      investmentType,
      equityPercentage,
      revenueSharePercentage,
      terms,
      message,
    });

    res.status(201).json(investment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get investments made by the current user (investor)
// @route   GET /api/investments/investor
// @access  Private
export const getInvestmentsByInvestor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const investorId = req.user?._id;
    const investments = await Investment.find({ investorId })
      .populate("businessId", "title financials")
      .populate("sellerId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get investments received by the current user (seller)
// @route   GET /api/investments/seller
// @access  Private
export const getInvestmentsBySeller = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sellerId = req.user?._id;
    const investments = await Investment.find({ sellerId })
      .populate("businessId", "title financials")
      .populate("investorId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active investments for current user
// @route   GET /api/investments/active
// @access  Private
export const getActiveInvestments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const investments = await Investment.find({
      $or: [{ investorId: userId }, { sellerId: userId }],
      status: "active",
    })
      .populate("businessId", "title financials")
      .populate("investorId", "profile.name email")
      .populate("sellerId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(investments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve an investment
// @route   PUT /api/investments/:id/approve
// @access  Private (Seller)
export const approveInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const investment = await Investment.findById(id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.sellerId.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to approve this investment" });
    }

    if (investment.status !== "pending") {
      return res.status(400).json({ message: "Investment is not pending" });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate commission (5%)
      const commissionAmount = investment.investmentAmount * COMMISSION_RATE;
      const sellerPayout = investment.investmentAmount - commissionAmount;

      // 1. Update investment status
      investment.status = "approved";

      // 2. Create Escrow Transaction
      const escrowTransaction = await EscrowTransaction.create(
        [
          {
            buyerId: investment.investorId,
            sellerId: investment.sellerId,
            businessId: investment.businessId,
            amount: investment.investmentAmount,
            transactionType: "investment",
            relatedDocumentId: investment._id,
            commissionAmount,
            sellerPayout,
            status: "pending",
            logs: [
              {
                action: "Created from approved investment",
                user: sellerId,
                timestamp: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      // 3. Create Commission Record
      await Commission.create(
        [
          {
            transactionId: escrowTransaction[0]._id,
            transactionType: "investment",
            amount: commissionAmount,
            transactionAmount: investment.investmentAmount,
            buyerId: investment.investorId,
            sellerId: investment.sellerId,
            businessId: investment.businessId,
            status: "pending",
          },
        ],
        { session }
      );

      investment.escrowTransactionId = escrowTransaction[0]._id;
      await investment.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json(investment);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject an investment
// @route   PUT /api/investments/:id/reject
// @access  Private (Seller)
export const rejectInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const investment = await Investment.findById(id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.sellerId.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this investment" });
    }

    if (investment.status !== "pending") {
      return res.status(400).json({ message: "Investment is not pending" });
    }

    investment.status = "rejected";
    investment.sellerResponse = reason;
    await investment.save();

    res.json(investment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Withdraw an investment
// @route   PUT /api/investments/:id/withdraw
// @access  Private (Investor)
export const withdrawInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const investorId = req.user?._id;

    if (!investorId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const investment = await Investment.findById(id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.investorId.toString() !== investorId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to withdraw this investment" });
    }

    if (investment.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Investment cannot be withdrawn" });
    }

    investment.status = "withdrawn";
    await investment.save();

    res.json(investment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get investment by ID
// @route   GET /api/investments/:id
// @access  Private
export const getInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate("businessId", "title financials")
      .populate("investorId", "profile.name email")
      .populate("sellerId", "profile.name email");

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    // Check if user is authorized
    const userId = req.user?._id?.toString();
    const investorId = (investment.investorId as any)._id?.toString();
    const sellerId = (investment.sellerId as any)._id?.toString();

    if (
      userId !== investorId &&
      userId !== sellerId &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(investment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
