import mongoose, { Schema, Document } from "mongoose";

export interface IInvestment extends Document {
  investorId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  investmentAmount: number;
  investmentType: "equity" | "revenue_share"; // Type of investment
  equityPercentage?: number; // If equity-based
  revenueSharePercentage?: number; // If revenue-sharing
  terms: {
    duration?: number; // In months
    conditions: string; // Investment conditions
    exitStrategy?: string; // How investor can exit
  };
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "withdrawn";
  message?: string; // Investor's message
  sellerResponse?: string; // Seller's response
  escrowTransactionId?: mongoose.Types.ObjectId;
  contractId?: mongoose.Types.ObjectId;
  commissionPaid: boolean; // Admin commission status
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema: Schema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    investmentAmount: { type: Number, required: true },
    investmentType: {
      type: String,
      enum: ["equity", "revenue_share"],
      required: true,
    },
    equityPercentage: { type: Number },
    revenueSharePercentage: { type: Number },
    terms: {
      duration: { type: Number },
      conditions: { type: String, required: true },
      exitStrategy: { type: String },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "withdrawn",
      ],
      default: "pending",
    },
    message: { type: String },
    sellerResponse: { type: String },
    escrowTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowTransaction",
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
    },
    commissionPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for efficient querying
InvestmentSchema.index({ investorId: 1 });
InvestmentSchema.index({ sellerId: 1 });
InvestmentSchema.index({ businessId: 1 });
InvestmentSchema.index({ status: 1 });

export default mongoose.model<IInvestment>("Investment", InvestmentSchema);
