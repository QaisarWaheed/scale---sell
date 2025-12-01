import mongoose from "mongoose";
import Listing from "../models/Listing";

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://anasaltaf:anas5altafnoob@scaleandsell.edzemdh.mongodb.net/?appName=scaleandsell";

async function checkListings() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    const listings = await Listing.find({}).select('_id title sellerId');
    console.log("\n=== ALL LISTINGS ===");
    console.log(`Total: ${listings.length}`);
    listings.forEach(listing => {
      console.log(`- ${listing._id}: ${listing.title} (seller: ${listing.sellerId})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkListings();
