import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import EscrowTransaction from "../models/EscrowTransaction";
import Listing from "../models/Listing";
import User from "../models/User";
import Commission from "../models/Commission";
import escrowService from "../services/escrowService";

const COMMISSION_RATE = 0.05; // 5% commission

// @desc    Initiate escrow transaction
// @route   POST /api/escrow
// @access  Private (Investor)
export const initiateTransaction = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { businessId, amount, transactionType = "purchase" } = req.body;

    const listing = await Listing.findById(businessId).populate("sellerId");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const buyer = await User.findById(authReq.user?._id);
    if (!buyer) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate commission
    const commissionAmount = amount * COMMISSION_RATE;
    const sellerPayout = amount - commissionAmount;

    // Create local transaction first
    const transaction = await EscrowTransaction.create({
      buyerId: authReq.user?._id,
      sellerId: listing.sellerId,
      businessId,
      amount,
      transactionType,
      commissionAmount,
      sellerPayout,
      logs: [{ action: "Transaction Initiated", user: authReq.user?._id }],
    });

    // Create commission record
    await Commission.create({
      transactionId: transaction._id,
      transactionType,
      amount: commissionAmount,
      transactionAmount: amount,
      buyerId: authReq.user?._id,
      sellerId: listing.sellerId,
      businessId,
      status: "pending",
    });

    // If Escrow.com is configured, create transaction on their platform
    if (escrowService.isConfigured()) {
      try {
        const seller = listing.sellerId as any;

        const escrowTransaction = await escrowService.createTransaction({
          buyer: {
            email: buyer.email,
            name: buyer.profile?.name || buyer.email,
            phone: buyer.profile?.phone,
          },
          seller: {
            email: seller.email,
            name: seller.profile?.name || seller.email,
            phone: seller.profile?.phone,
          },
          items: [
            {
              title: listing.title,
              description: listing.description || "Business acquisition",
              type: "general_merchandise",
              inspection_period: 7,
              quantity: 1,
              schedule: [
                {
                  amount: amount,
                  payer_customer: buyer.email,
                  beneficiary_customer: seller.email,
                },
              ],
            },
          ],
          currency: "USD",
          description: `Purchase of ${listing.title}`,
        });

        // Update transaction with Escrow.com data
        transaction.escrowComTransactionId = escrowTransaction.id;
        transaction.escrowComStatus = escrowTransaction.status;
        transaction.paymentUrl = escrowTransaction.payment_url;
        transaction.escrowComData = escrowTransaction;
        transaction.logs.push({
          action: "Escrow.com transaction created",
          timestamp: new Date(),
          user: authReq.user?._id!,
        });
        await transaction.save();
      } catch (escrowError: any) {
        console.error("Failed to create Escrow.com transaction:", escrowError);
        // Continue without Escrow.com integration
        transaction.logs.push({
          action: "Escrow.com integration failed - using internal escrow",
          timestamp: new Date(),
          user: authReq.user?._id!,
        });
        await transaction.save();
      }
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update transaction status
// @route   PUT /api/escrow/:id/status
// @access  Private (Admin/Seller/Buyer depending on state)
export const updateStatus = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { status } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If releasing funds, update commission status
    if (status === "released" && transaction.status !== "released") {
      await Commission.findOneAndUpdate(
        { transactionId: transaction._id },
        { status: "collected", collectedAt: new Date() }
      );
    }

    // Add logic for who can change what status
    // For MVP, letting Admin do everything or simple checks

    transaction.status = status;
    transaction.logs.push({
      action: `Status changed to ${status}`,
      timestamp: new Date(),
      user: authReq.user?._id!,
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
export const getTransactions = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const transactions = await EscrowTransaction.find({
      $or: [{ buyerId: authReq.user?._id }, { sellerId: authReq.user?._id }],
    })
      .populate("businessId", "title description")
      .populate("buyerId", "email profile")
      .populate("sellerId", "email profile")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/escrow/:id
// @access  Private
export const getTransaction = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const transaction = await EscrowTransaction.findById(req.params.id)
      .populate("businessId", "title")
      .populate("buyerId", "profile.name email")
      .populate("sellerId", "profile.name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if user is authorized to view this transaction
    const userId = authReq.user?._id?.toString();
    const buyerId = (transaction.buyerId as any)._id?.toString();
    const sellerId = (transaction.sellerId as any)._id?.toString();

    if (
      userId !== buyerId &&
      userId !== sellerId &&
      authReq.user?.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle Escrow.com webhook
// @route   POST /api/escrow/webhook
// @access  Public (but verified)
export const handleWebhook = async (req: any, res: Response) => {
  try {
    const signature = req.headers["x-escrow-signature"] || "";
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!escrowService.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const { transaction_id, status, event } = req.body;

    // Find transaction by Escrow.com ID
    const transaction = await EscrowTransaction.findOne({
      escrowComTransactionId: transaction_id,
    });

    if (!transaction) {
      console.warn(
        `Transaction not found for Escrow.com ID: ${transaction_id}`
      );
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update transaction status based on webhook
    const newStatus = escrowService.mapEscrowStatus(status);
    transaction.escrowComStatus = status;
    transaction.status = newStatus as any;
    transaction.logs.push({
      action: `Webhook received: ${event} - Status: ${status}`,
      timestamp: new Date(),
      user: transaction.buyerId,
    });

    await transaction.save();

    res.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};
