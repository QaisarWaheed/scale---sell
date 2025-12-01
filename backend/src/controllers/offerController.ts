import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Offer from "../models/Offer";
import Listing from "../models/Listing";
import EscrowTransaction from "../models/EscrowTransaction";
import Commission from "../models/Commission";
import Contract from "../models/Contract";
import User from "../models/User";
import mongoose from "mongoose";
import { generateContractPDF } from "../services/pdfService";

const COMMISSION_RATE = 0.05; // 5% commission

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Investor)
export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, offerAmount, paymentMethod, paymentDetails, message } =
      req.body;
    const buyerId = req.user?._id;

    console.log("Creating offer:", { businessId, offerAmount, paymentMethod, buyerId: buyerId?.toString() });

    if (!buyerId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!businessId) {
      return res.status(400).json({ message: "Business ID is required" });
    }

    const listing = await Listing.findById(businessId);
    console.log("Listing found:", listing ? listing._id : "NOT FOUND");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if user already has a pending offer for this listing
    const existingOffer = await Offer.findOne({
      buyerId,
      businessId,
      status: "pending",
    });

    if (existingOffer) {
      return res.status(400).json({
        message: "You already have a pending offer for this listing",
      });
    }

    const offer = await Offer.create({
      buyerId,
      sellerId: listing.sellerId,
      businessId,
      offerAmount,
      paymentMethod,
      paymentDetails,
      message,
    });

    console.log("Offer created successfully:", offer._id);
    res.status(201).json(offer);
  } catch (error: any) {
    console.error("Error creating offer:", error);
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
      .populate("escrowTransactionId", "paymentUrl status amount")
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
      .populate("escrowTransactionId", "paymentUrl status amount")
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
      // Calculate commission (5%)
      const commissionAmount = offer.offerAmount * COMMISSION_RATE;
      const sellerPayout = offer.offerAmount - commissionAmount;

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
            transactionType: "purchase",
            relatedDocumentId: offer._id,
            commissionAmount,
            sellerPayout,
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

      //  3. Create Commission Record
      await Commission.create(
        [
          {
            transactionId: escrowTransaction[0]._id,
            transactionType: "purchase",
            amount: commissionAmount,
            transactionAmount: offer.offerAmount,
            buyerId: offer.buyerId,
            sellerId: offer.sellerId,
            businessId: offer.businessId,
            status: "pending",
          },
        ],
        { session }
      );

      offer.escrowTransactionId = escrowTransaction[0]._id;
      await offer.save({ session });

      // 4. Auto-generate Contract
      try {
        const buyer = await User.findById(offer.buyerId);
        const seller = await User.findById(offer.sellerId);
        const listing = await Listing.findById(offer.businessId);

        if (buyer && seller && listing) {
          const pdfUrl = await generateContractPDF(
            escrowTransaction[0],
            buyer,
            seller,
            listing
          );

          await Contract.create(
            [
              {
                transactionId: escrowTransaction[0]._id,
                contractType: "purchase",
                terms: {
                  businessName: listing.title,
                  amount: offer.offerAmount,
                  commissionAmount,
                  sellerPayout,
                },
                pdfUrl,
              },
            ],
            { session }
          );
          console.log(`Contract auto-generated for transaction ${escrowTransaction[0]._id}`);
        }
      } catch (contractError) {
        console.error("Contract generation failed (non-critical):", contractError);
        // Don't fail the transaction if contract generation fails
      }

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
