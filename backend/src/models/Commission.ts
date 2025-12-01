import mongoose, { Schema, Document } from "mongoose";

export interface ICommission extends Document {
  transactionId: mongoose.Types.ObjectId;
  transactionType: "purchase" | "investment";
  amount: number; // Commission amount (5% of transaction)
  transactionAmount: number; // Original transaction amount
  status: "pending" | "collected" | "refunded";
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  collectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowTransaction",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["purchase", "investment"],
      required: true,
    },
    amount: { type: Number, required: true },
    transactionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "collected", "refunded"],
      default: "pending",
    },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    collectedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient querying
CommissionSchema.index({ transactionId: 1 });
CommissionSchema.index({ status: 1 });
CommissionSchema.index({ createdAt: -1 });
CommissionSchema.index({ transactionType: 1 });

export default mongoose.model<ICommission>("Commission", CommissionSchema);
