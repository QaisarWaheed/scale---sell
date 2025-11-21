import dotenv from "dotenv";
import path from "path";

// Load env vars FIRST before any other imports
dotenv.config();
dotenv.config({ path: path.join(__dirname, "../../.env") });

import app from "./app";
import { connectDB } from "./config/db";
import { initializeCollections } from "./config/initDb";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Initialize MongoDB collections and indexes
  await initializeCollections();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
