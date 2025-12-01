import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateContractPDF = (
  transaction: any,
  buyer: any,
  seller: any,
  listing: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `contract-${transaction._id}.pdf`;
    const filePath = path.join(__dirname, "../../uploads", fileName);

    // Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, "../../uploads"))) {
      fs.mkdirSync(path.join(__dirname, "../../uploads"), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const isInvestment = transaction.transactionType === "investment";

    // PDF Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(
        isInvestment ? "Investment Agreement" : "Business Purchase Agreement",
        { align: "center" }
      );
    doc.moveDown();

    // Date and Transaction ID
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Date: ${new Date().toDateString()}`, { align: "right" });
    doc.text(`Contract ID: ${transaction._id}`, { align: "right" });
    doc.moveDown(2);

    // Parties Section
    doc.fontSize(14).font("Helvetica-Bold").text("Parties to this Agreement:");
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`${isInvestment ? "Investor" : "Buyer"}:`, { continued: false });
    doc.fontSize(10).text(`   Name: ${buyer.profile?.name || "N/A"}`);
    doc.text(`   Email: ${buyer.email}`);
    doc.text(
      `   Contact: ${buyer.profile?.phone || "N/A"}`
    );
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica").text("Seller:", { continued: false });
    doc.fontSize(10).text(`   Name: ${seller.profile?.name || "N/A"}`);
    doc.text(`   Email: ${seller.email}`);
    doc.text(`   Contact: ${seller.profile?.phone || "N/A"}`);
    doc.moveDown(2);

    // Business/Listing Details
    doc.fontSize(14).font("Helvetica-Bold").text("Business Details:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").text(`Business Name: ${listing.title}`);
    doc.text(`Category: ${listing.category}`);
    doc.text(`Location: ${listing.location}`);
    doc.moveDown(2);

    // Financial Terms
    doc.fontSize(14).font("Helvetica-Bold").text("Financial Terms:");
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `${isInvestment ? "Investment" : "Purchase"} Amount: PKR ${transaction.amount.toLocaleString()}`
      );
    doc.text(
      `Platform Commission (5%): PKR ${transaction.commissionAmount.toLocaleString()}`
    );
    doc.text(
      `Seller Payout (95%): PKR ${transaction.sellerPayout.toLocaleString()}`
    );
    doc.moveDown(2);

    // Terms and Conditions
    doc.fontSize(14).font("Helvetica-Bold").text("Terms and Conditions:");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");

    if (isInvestment) {
      doc.text(
        "1. The Investor agrees to provide the specified investment amount to the Seller's business as outlined above."
      );
      doc.text(
        "2. The Seller agrees to use the investment funds as specified in the investment terms."
      );
      doc.text(
        "3. Returns, equity sharing, or revenue sharing will be as per the agreed investment structure."
      );
    } else {
      doc.text(
        "1. The Seller agrees to transfer complete ownership and all associated assets of the business to the Buyer."
      );
      doc.text(
        "2. The Buyer agrees to pay the agreed purchase amount through the Scale & Sell escrow system."
      );
      doc.text(
        "3. The transfer of ownership will be completed within 30 days of contract execution."
      );
    }

    doc.text(
      "4. A 5% platform commission will be deducted from the total amount, and 95% will be paid to the Seller."
    );
    doc.text(
      "5. Funds will be held in escrow until all parties fulfill their obligations and the administrator approves."
    );
    doc.text(
      "6. This agreement is governed by the laws of Pakistan and is facilitated through Scale & Sell platform."
    );
    doc.text(
      "7. Both parties agree to resolve disputes through mediation before pursuing legal action."
    );
    doc.moveDown(3);

    // Signatures
    doc.fontSize(14).font("Helvetica-Bold").text("Signatures:");
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`${isInvestment ? "Investor" : "Buyer"} Signature:`, 100, doc.y);
    doc.text("_______________________", 300, doc.y - 12);
    doc.moveDown(1.5);
    doc.text("Seller Signature:", 100, doc.y);
    doc.text("_______________________", 300, doc.y - 12);
    doc.moveDown(1.5);
    doc.text("Admin Approval:", 100, doc.y);
    doc.text("_______________________", 300, doc.y - 12);

    // Footer
    doc.moveDown(3);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("gray")
      .text(
        "This document is electronically generated by Scale & Sell platform",
        { align: "center" }
      );
    doc.text("For support, contact: support@scaleandsell.com", {
      align: "center",
    });

    doc.end();

    stream.on("finish", async () => {
      try {
        // Upload to Cloudinary with public access
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "contracts",
          resource_type: "raw", // Use 'raw' for PDF files
          public_id: `contract-${transaction._id}`,
          access_mode: "public", // Make file publicly accessible
          type: "upload",
        });

        // Delete local file
        fs.unlinkSync(filePath);

        resolve(result.secure_url);
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        // Fallback to local backend URL if Cloudinary fails
        const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
        resolve(`${backendUrl}/uploads/${fileName}`);
      }
    });

    stream.on("error", (err) => reject(err));
  });
};
