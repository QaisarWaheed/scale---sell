import mongoose from "mongoose";
import Thread from "../models/Thread";
import Message from "../models/Message";

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://anasaltaf:anas5altafnoob@scaleandsell.edzemdh.mongodb.net/?appName=scaleandsell";

async function fixNullBusinessIds() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Find all threads with null businessId
    const threadsWithNull = await Thread.find({ 
      businessId: null 
    });

    console.log(`Found ${threadsWithNull.length} threads with null businessId`);

    if (threadsWithNull.length === 0) {
      console.log("No threads to fix!");
      process.exit(0);
    }

    // For each thread, try to get businessId from its messages
    for (const thread of threadsWithNull) {
      const message = await Message.findOne({ 
        threadId: thread._id,
        businessId: { $ne: null }
      });

      if (message && message.businessId) {
        console.log(`Fixing thread ${thread._id} with businessId from message: ${message.businessId}`);
        thread.businessId = message.businessId;
        await thread.save();
      } else {
        console.log(`⚠️  Thread ${thread._id} has no messages with businessId - will be deleted`);
        await Thread.deleteOne({ _id: thread._id });
        await Message.deleteMany({ threadId: thread._id });
      }
    }

    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

fixNullBusinessIds();
