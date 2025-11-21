import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  transactionId: mongoose.Types.ObjectId;
  pdfUrl: string;
  signatures: {
    buyer: boolean;
    seller: boolean;
    buyerSignedAt?: Date;
    sellerSignedAt?: Date;
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
    pdfUrl: { type: String, required: true },
    signatures: {
      buyer: { type: Boolean, default: false },
      seller: { type: Boolean, default: false },
      buyerSignedAt: Date,
      sellerSignedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", ContractSchema);
