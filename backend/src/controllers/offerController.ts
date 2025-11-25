import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Offer from "../models/Offer";
import Business from "../models/Business";
import EscrowTransaction from "../models/EscrowTransaction";
import mongoose from "mongoose";

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Investor)
export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, offerAmount, paymentMethod, paymentDetails, message } =
      req.body;
    const buyerId = req.user?._id;

    if (!buyerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Check if user already has a pending offer for this business
    const existingOffer = await Offer.findOne({
      buyerId,
      businessId,
      status: "pending",
    });

    if (existingOffer) {
      return res.status(400).json({
        message: "You already have a pending offer for this business",
      });
    }

    const offer = await Offer.create({
      buyerId,
      sellerId: business.sellerId,
      businessId,
      offerAmount,
      paymentMethod,
      paymentDetails,
      message,
    });

    res.status(201).json(offer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get offers made by the current user (buyer)
// @route   GET /api/offers/buyer
// @access  Private
export const getOffersByBuyer = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user?._id;
    const offers = await Offer.find({ buyerId })
      .populate("businessId", "title financials.askingPrice")
      .populate("sellerId", "profile.name")
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get offers received by the current user (seller)
// @route   GET /api/offers/seller
// @access  Private
export const getOffersBySeller = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?._id;
    const offers = await Offer.find({ sellerId })
      .populate("businessId", "title financials.askingPrice")
      .populate("buyerId", "profile.name email")
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve an offer
// @route   PUT /api/offers/:id/approve
// @access  Private (Seller)
export const approveOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.sellerId.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to approve this offer" });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Offer is not pending" });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Update offer status
      offer.status = "approved";

      // 2. Create Escrow Transaction
      const escrowTransaction = await EscrowTransaction.create(
        [
          {
            buyerId: offer.buyerId,
            sellerId: offer.sellerId,
            businessId: offer.businessId,
            amount: offer.offerAmount,
            status: "pending",
            logs: [
              {
                action: "Created from approved offer",
                user: sellerId,
                timestamp: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      offer.escrowTransactionId = escrowTransaction[0]._id;
      await offer.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json(offer);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject an offer
// @route   PUT /api/offers/:id/reject
// @access  Private (Seller)
export const rejectOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sellerId = req.user?._id;

    if (!sellerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.sellerId.toString() !== sellerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this offer" });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Offer is not pending" });
    }

    offer.status = "rejected";
    offer.sellerResponse = reason;
    await offer.save();

    res.json(offer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Withdraw an offer
// @route   PUT /api/offers/:id/withdraw
// @access  Private (Buyer)
export const withdrawOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const buyerId = req.user?._id;

    if (!buyerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.buyerId.toString() !== buyerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to withdraw this offer" });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Offer cannot be withdrawn" });
    }

    offer.status = "withdrawn";
    await offer.save();

    res.json(offer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
