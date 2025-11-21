import mongoose, { Document, Schema } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  category: string;
  location: string;
  financials: {
    askingPrice: number;
    revenue: number;
    profit?: number;
    ebitda?: number;
  };
  details: {
    yearEstablished?: number;
    employees?: number;
    website?: string;
    reasonForSelling?: string;
  };
  status: "pending" | "approved" | "rejected";
  seller: mongoose.Types.ObjectId; // reference to User
  images: string[]; // URLs
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    financials: {
      askingPrice: { type: Number, required: true },
      revenue: { type: Number, required: true },
      profit: { type: Number },
      ebitda: { type: Number },
    },
    details: {
      yearEstablished: { type: Number },
      employees: { type: Number },
      website: { type: String },
      reasonForSelling: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IListing>("Listing", ListingSchema);
