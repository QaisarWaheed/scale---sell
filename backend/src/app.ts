import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import escrowRoutes from "./routes/escrowRoutes";
import contractRoutes from "./routes/contractRoutes";
import messageRoutes from "./routes/messageRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import offerRoutes from "./routes/offerRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import commissionRoutes from "./routes/commissionRoutes";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/commissions", commissionRoutes);

app.get("/", (req, res) => {
  res.send("Scale & Sell API is running");
});

export default app;
