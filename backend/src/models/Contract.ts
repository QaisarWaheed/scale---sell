import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  transactionId: mongoose.Types.ObjectId;
  contractType: "purchase" | "investment";
  terms: {
    businessName: string;
    amount: number;
    commissionAmount: number;
    sellerPayout: number;
    specificTerms?: string; // Type-specific terms
  };
  pdfUrl: string;
  signatures: {
    buyer: boolean;
    seller: boolean;
    buyerSignedAt?: Date;
    sellerSignedAt?: Date;
    adminApproved: boolean; // Admin must approve
    adminApprovedAt?: Date;
    adminApprovedBy?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema: Schema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowTransaction",
      required: true,
    },
    contractType: {
      type: String,
      enum: ["purchase", "investment"],
      required: true,
    },
    terms: {
      businessName: { type: String, required: true },
      amount: { type: Number, required: true },
      commissionAmount: { type: Number, required: true },
      sellerPayout: { type: Number, required: true },
      specificTerms: { type: String },
    },
    pdfUrl: { type: String, required: true },
    signatures: {
      buyer: { type: Boolean, default: false },
      seller: { type: Boolean, default: false },
      buyerSignedAt: Date,
      sellerSignedAt: Date,
      adminApproved: { type: Boolean, default: false },
      adminApprovedAt: Date,
      adminApprovedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", ContractSchema);
