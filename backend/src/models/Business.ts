import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description: string;
  location: string;
  financials: {
    revenue: number;
    profit: number;
    askingPrice: number;
  };
  images: string[];
  status: "pending" | "approved" | "rejected" | "sold";
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    financials: {
      revenue: { type: Number, required: true },
      profit: { type: Number, required: true },
      askingPrice: { type: Number, required: true },
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Text index for search
BusinessSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model<IBusiness>("Business", BusinessSchema);
