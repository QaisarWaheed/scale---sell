import mongoose from "mongoose";
import Contract from "../models/Contract";

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://anasaltaf:anas5altafnoob@scaleandsell.edzemdh.mongodb.net/?appName=scaleandsell";

async function checkContract() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    const contract = await Contract.findOne().sort({ createdAt: -1 });
    
    if (!contract) {
      console.log("No contracts found");
      process.exit(0);
    }

    console.log("\n=== Latest Contract ===");
    console.log("ID:", contract._id);
    console.log("Type:", contract.contractType);
    console.log("PDF URL:", contract.pdfUrl);
    console.log("Business:", contract.terms.businessName);
    console.log("Amount:", contract.terms.amount);
    console.log("Created:", contract.createdAt);
    console.log("Buyer Signed:", contract.signatures.buyer);
    console.log("Seller Signed:", contract.signatures.seller);
    console.log("Admin Approved:", contract.signatures.adminApproved);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkContract();
