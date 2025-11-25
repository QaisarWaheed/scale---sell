import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `Supabase URL: ${process.env.SUPABASE_URL ? "Set" : "Not Set"}`
      );
      console.log(
        `Supabase Key: ${
          process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not Set"
        }`
      );
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
