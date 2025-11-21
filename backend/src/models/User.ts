import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  supabaseId: string;
  email: string;
  role: "investor" | "seller" | "admin";
  profile: {
    name?: string;
    phone?: string;
    location?: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    supabaseId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["investor", "seller", "admin"],
      default: "investor",
    },
    profile: {
      name: String,
      phone: String,
      location: String,
      avatarUrl: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
