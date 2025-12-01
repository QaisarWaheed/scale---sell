import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Contract from "../models/Contract";
import EscrowTransaction from "../models/EscrowTransaction";
import User from "../models/User";
import Listing from "../models/Listing";
import { generateContractPDF } from "../services/pdfService";

// @desc    Generate contract for a transaction
// @route   POST /api/contracts
// @access  Private
export const createContract = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.body;

    const transaction = await EscrowTransaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    const buyer = await User.findById(transaction.buyerId);
    const seller = await User.findById(transaction.sellerId);
    const listing = await Listing.findById(transaction.businessId);

    if (!buyer || !seller || !listing) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const pdfUrl = await generateContractPDF(
      transaction,
      buyer,
      seller,
      listing
    );

    const contract = await Contract.create({
      transactionId,
      contractType: transaction.transactionType,
      terms: {
        businessName: listing.title,
        amount: transaction.amount,
        commissionAmount: transaction.commissionAmount,
        sellerPayout: transaction.sellerPayout,
      },
      pdfUrl,
    });

    res.status(201).json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sign contract
// @route   PUT /api/contracts/:id/sign
// @access  Private
export const signContract = async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id).populate(
      "transactionId"
    );
    if (!contract)
      return res.status(404).json({ message: "Contract not found" });

    const transaction = contract.transactionId as any;

    if (req.user?._id.toString() === transaction.buyerId.toString()) {
      contract.signatures.buyer = true;
      contract.signatures.buyerSignedAt = new Date();
    } else if (req.user?._id.toString() === transaction.sellerId.toString()) {
      contract.signatures.seller = true;
      contract.signatures.sellerSignedAt = new Date();
    } else {
      return res
        .status(401)
        .json({ message: "Not authorized to sign this contract" });
    }

    await contract.save();

    // If both signed, update transaction status
    if (contract.signatures.buyer && contract.signatures.seller) {
      await EscrowTransaction.findByIdAndUpdate(transaction._id, {
        status: "holding",
        $push: {
          logs: {
            action: "Contract Signed by both parties",
            user: req.user?._id,
          },
        },
      });
    }

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contract
// @route   GET /api/contracts/:transactionId
// @access  Private
export const getContract = async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findOne({
      transactionId: req.params.transactionId,
    });
    if (contract) {
      res.json(contract);
    } else {
      res.status(404).json({ message: "Contract not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contracts for the current user
// @route   GET /api/contracts/user/all
// @access  Private
export const getUserContracts = async (req: AuthRequest, res: Response) => {
  try {
    // Find all contracts where the user is either buyer or seller
    const contracts = await Contract.find().populate({
      path: "transactionId",
      populate: [{ path: "buyerId" }, { path: "sellerId" }],
    });

    // Filter contracts where user is involved
    const userContracts = contracts.filter((contract: any) => {
      const transaction = contract.transactionId;
      if (!transaction) return false;

      const buyerId =
        typeof transaction.buyerId === "object"
          ? transaction.buyerId._id.toString()
          : transaction.buyerId.toString();
      const sellerId =
        typeof transaction.sellerId === "object"
          ? transaction.sellerId._id.toString()
          : transaction.sellerId.toString();

      return (
        buyerId === req.user?._id.toString() ||
        sellerId === req.user?._id.toString()
      );
    });

    res.json(userContracts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin approve contract
// @route   PUT /api/contracts/:id/admin/approve
// @access  Private (Admin)
export const adminApproveContract = async (req: AuthRequest, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id).populate(
      "transactionId"
    );
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Check if user is admin
    const user = await User.findById(req.user?._id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only administrators can approve contracts" });
    }

    // Check if both parties have signed
    if (!contract.signatures.buyer || !contract.signatures.seller) {
      return res.status(400).json({
        message: "Contract must be signed by both parties before approval",
      });
    }

    // Approve contract
    contract.signatures.adminApproved = true;
    contract.signatures.adminApprovedAt = new Date();
    contract.signatures.adminApprovedBy = req.user?._id;
    await contract.save();

    // Update escrow transaction status to "holding"
    const transaction = contract.transactionId as any;
    if (transaction) {
      await EscrowTransaction.findByIdAndUpdate(transaction._id, {
        status: "holding",
        $push: {
          logs: {
            action: "Contract approved by admin - funds ready for release",
            user: req.user?._id,
            timestamp: new Date(),
          },
        },
      });
    }

    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contracts (admin only)
// @route   GET /api/contracts/all
// @access  Private (Admin)
export const getAllContracts = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user?._id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only administrators can view all contracts" });
    }

    const contracts = await Contract.find()
      .populate({
        path: "transactionId",
        populate: [
          { path: "buyerId", select: "email profile" },
          { path: "sellerId", select: "email profile" },
          { path: "businessId", select: "title category location" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
