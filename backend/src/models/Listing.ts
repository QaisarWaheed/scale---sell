import mongoose, { Document, Schema } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  category: string;
  location: string;
  listingType: "sale" | "investment" | "both"; // Type of listing
  investmentOptions?: {
    seekingInvestment: boolean;
    minInvestment?: number;
    maxInvestment?: number;
    equityOffered?: number; // Percentage
    revenueShareOffered?: number; // Percentage
    investmentPurpose?: string; // What the investment will be used for
  };
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
    listingType: {
      type: String,
      enum: ["sale", "investment", "both"],
      default: "sale",
    },
    investmentOptions: {
      seekingInvestment: { type: Boolean, default: false },
      minInvestment: { type: Number },
      maxInvestment: { type: Number },
      equityOffered: { type: Number },
      revenueShareOffered: { type: Number },
      investmentPurpose: { type: String },
    },
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
      default: "approved",
    },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IListing>("Listing", ListingSchema);
