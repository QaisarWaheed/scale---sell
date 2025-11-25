import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  offerAmount: number;
  paymentMethod: "jazzcash" | "easypaisa" | "bank_transfer" | "other";
  paymentDetails: {
    phoneNumber?: string;
    accountNumber?: string;
    bankName?: string;
    accountTitle?: string;
  };
  status: "pending" | "approved" | "rejected" | "withdrawn";
  message?: string;
  sellerResponse?: string;
  escrowTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    offerAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank_transfer", "other"],
      required: true,
    },
    paymentDetails: {
      phoneNumber: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      accountTitle: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
    },
    message: { type: String },
    sellerResponse: { type: String },
    escrowTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowTransaction",
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
OfferSchema.index({ buyerId: 1 });
OfferSchema.index({ sellerId: 1 });
OfferSchema.index({ businessId: 1 });

export default mongoose.model<IOffer>("Offer", OfferSchema);
