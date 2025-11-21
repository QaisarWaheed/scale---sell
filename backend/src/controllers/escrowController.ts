import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import EscrowTransaction from "../models/EscrowTransaction";
import Business from "../models/Business";

// @desc    Initiate escrow transaction
// @route   POST /api/escrow
// @access  Private (Investor)
export const initiateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, amount } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const transaction = await EscrowTransaction.create({
      buyerId: req.user?._id,
      sellerId: business.sellerId,
      businessId,
      amount,
      logs: [{ action: "Transaction Initiated", user: req.user?._id }],
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update transaction status
// @route   PUT /api/escrow/:id/status
// @access  Private (Admin/Seller/Buyer depending on state)
export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Add logic for who can change what status
    // For MVP, letting Admin do everything or simple checks

    transaction.status = status;
    transaction.logs.push({
      action: `Status changed to ${status}`,
      timestamp: new Date(),
      user: req.user?._id!,
    });

    await transaction.save();
    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/escrow
// @access  Private
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await EscrowTransaction.find({
      $or: [{ buyerId: req.user?._id }, { sellerId: req.user?._id }],
    })
      .populate("businessId", "title")
      .populate("buyerId", "profile.name")
      .populate("sellerId", "profile.name");

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
