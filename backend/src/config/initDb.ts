import mongoose from "mongoose";
import User from "../models/User";
import Business from "../models/Business";
import EscrowTransaction from "../models/EscrowTransaction";
import Contract from "../models/Contract";
import Message from "../models/Message";

/**
 * Initialize MongoDB Collections
 *
 * This script ensures all collections are created with proper indexes.
 * Mongoose automatically creates collections when documents are saved,
 * but this script explicitly creates them and ensures indexes are built.
 */

export const initializeCollections = async () => {
  try {
    console.log("🔧 Initializing MongoDB collections...");

    // Create collections if they don't exist
    const collections = [
      { name: "users", model: User },
      { name: "businesses", model: Business },
      { name: "escrowtransactions", model: EscrowTransaction },
      { name: "contracts", model: Contract },
      { name: "messages", model: Message },
    ];

    for (const { name, model } of collections) {
      try {
        // Create collection if it doesn't exist
        await model.createCollection();
        console.log(`✅ Collection '${name}' ready`);
      } catch (error: any) {
        if (error.code === 48) {
          // Collection already exists
          console.log(`ℹ️  Collection '${name}' already exists`);
        } else {
          throw error;
        }
      }

      // Ensure indexes are created
      await model.syncIndexes();
      console.log(`✅ Indexes synced for '${name}'`);
    }

    console.log("✨ MongoDB collections initialized successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error initializing collections:", error);
    throw error;
  }
};

/**
 * Get collection statistics
 */
export const getCollectionStats = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const stats = {
      users: await User.countDocuments(),
      businesses: await Business.countDocuments(),
      escrowTransactions: await EscrowTransaction.countDocuments(),
      contracts: await Contract.countDocuments(),
      messages: await Message.countDocuments(),
    };

    return stats;
  } catch (error) {
    console.error("Error getting collection stats:", error);
    throw error;
  }
};

/**
 * Drop all collections (useful for testing/development)
 * WARNING: This will delete all data!
 */
export const dropAllCollections = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.drop();
      console.log(`Dropped collection: ${key}`);
    }

    console.log("All collections dropped");
  } catch (error) {
    console.error("Error dropping collections:", error);
    throw error;
  }
};
