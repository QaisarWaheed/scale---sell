import mongoose from "mongoose";
import Thread from "../models/Thread";
import Listing from "../models/Listing";

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://anasaltaf:anas5altafnoob@scaleandsell.edzemdh.mongodb.net/?appName=scaleandsell";
const threadId = "692e0847fb5e65550ba8550b";

async function checkThread() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    const thread = await Thread.findById(threadId);
    console.log("\n=== THREAD DATA ===");
    console.log(JSON.stringify(thread, null, 2));

    if (thread?.businessId) {
      console.log("\n=== CHECKING LISTING ===");
      console.log("BusinessId:", thread.businessId);
      
      const listing = await Listing.findById(thread.businessId);
      console.log("Listing found:", !!listing);
      if (listing) {
        console.log("Listing title:", listing.title);
      } else {
        console.log("⚠️  BusinessId references non-existent listing!");
      }
    } else {
      console.log("\n⚠️  Thread has NO businessId!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkThread();
