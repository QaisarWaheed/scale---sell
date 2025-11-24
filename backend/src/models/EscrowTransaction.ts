import mongoose, { Schema, Document } from "mongoose";

export interface IEscrowTransaction extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "holding" | "released" | "cancelled";
  escrowComTransactionId?: string;
  escrowComStatus?: string;
  paymentUrl?: string;
  escrowComData?: any;
  logs: {
    action: string;
    timestamp: Date;
    user: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EscrowTransactionSchema: Schema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "holding", "released", "cancelled"],
      default: "pending",
    },
    escrowComTransactionId: { type: String },
    escrowComStatus: { type: String },
    paymentUrl: { type: String },
    escrowComData: { type: Schema.Types.Mixed },
    logs: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEscrowTransaction>(
  "EscrowTransaction",
  EscrowTransactionSchema
);
