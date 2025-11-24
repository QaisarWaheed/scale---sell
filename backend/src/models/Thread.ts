import mongoose, { Schema, Document } from "mongoose";

export interface IThread extends Document {
  businessId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema: Schema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Index to quickly find threads by participants and business
ThreadSchema.index({ businessId: 1, participants: 1 });

export default mongoose.model<IThread>("Thread", ThreadSchema);
