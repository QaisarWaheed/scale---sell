import mongoose from "mongoose";
import dotenv from "dotenv";
import Thread from "../models/Thread";

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ Missing MongoDB URI");
  process.exit(1);
}

async function fixDuplicateThreads() {
  try {
    console.log("\n🔧 Fixing threads with duplicate participants...\n");
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri!);
    console.log("✅ Connected to MongoDB");

    // Find all threads
    const threads = await Thread.find({});
    console.log(`📊 Found ${threads.length} threads`);

    let fixedCount = 0;
    let deletedCount = 0;

    for (const thread of threads) {
      const participantIds = thread.participants.map((p) => p.toString());
      const uniqueParticipants = [...new Set(participantIds)];

      // Check if there are duplicate participants
      if (participantIds.length !== uniqueParticipants.length) {
        console.log(`\n🔍 Found thread with duplicates: ${thread._id}`);
        console.log(`   Original participants: ${participantIds.join(", ")}`);
        console.log(`   Unique participants: ${uniqueParticipants.join(", ")}`);

        // If both participants are the same person, delete the thread (invalid conversation)
        if (uniqueParticipants.length === 1) {
          console.log(`   ❌ Deleting invalid thread (self-conversation)`);
          await Thread.findByIdAndDelete(thread._id);
          deletedCount++;
        } else {
          // Update thread with unique participants
          thread.participants = uniqueParticipants.map(
            (id) => new mongoose.Types.ObjectId(id)
          );
          await thread.save();
          console.log(`   ✅ Fixed thread participants`);
          fixedCount++;
        }
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Fixed: ${fixedCount} threads`);
    console.log(`   Deleted: ${deletedCount} invalid threads`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    console.log("✨ Thread cleanup completed!");
  } catch (error: any) {
    console.error("\n❌ Error fixing threads:", error.message);
    await mongoose.disconnect();
    throw error;
  }
}

fixDuplicateThreads().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
