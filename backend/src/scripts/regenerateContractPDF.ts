import mongoose from "mongoose";
import dotenv from "dotenv";
import Contract, { IContract } from "../models/Contract";
import EscrowTransaction, { IEscrowTransaction } from "../models/EscrowTransaction";
import User, { IUser } from "../models/User";
import Listing, { IListing } from "../models/Listing";
import { generateContractPDF } from "../services/pdfService";

// Load environment variables
dotenv.config();

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://anasaltaf:anas5altafnoob@scaleandsell.edzemdh.mongodb.net/?appName=scaleandsell";

async function regenerateContractPDF() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Get the latest contract
    const contract = await Contract.findOne().sort({ createdAt: -1 });
    
    if (!contract) {
      console.log("No contracts found");
      process.exit(0);
    }

    console.log(`Regenerating PDF for contract ${contract._id}`);

    // Get transaction
    const transaction = await EscrowTransaction.findById(contract.transactionId);
    
    if (!transaction) {
      console.error("Transaction not found");
      process.exit(1);
    }
    
    // Get related data
    const buyer = await User.findById(transaction.buyerId);
    const seller = await User.findById(transaction.sellerId);
    const listing = await Listing.findById(transaction.businessId);

    if (!buyer || !seller || !listing) {
      console.error("Missing transaction data");
      process.exit(1);
    }

    console.log("Generating new PDF with public access...");
    const pdfUrl = await generateContractPDF(transaction, buyer, seller, listing);

    // Update contract with new URL
    contract.pdfUrl = pdfUrl;
    await contract.save();

    console.log("\n✅ Contract PDF regenerated successfully!");
    console.log("New PDF URL:", pdfUrl);
    console.log("\nYou can now access it publicly!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

regenerateContractPDF();
