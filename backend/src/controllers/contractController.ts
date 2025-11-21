import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Contract from "../models/Contract";
import EscrowTransaction from "../models/EscrowTransaction";
import User from "../models/User";
import Business from "../models/Business";
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
    const business = await Business.findById(transaction.businessId);

    if (!buyer || !seller || !business) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const pdfUrl = await generateContractPDF(
      transaction,
      buyer,
      seller,
      business
    );

    const contract = await Contract.create({
      transactionId,
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
