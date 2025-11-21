import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateContractPDF = (
  transaction: any,
  buyer: any,
  seller: any,
  business: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const fileName = `contract-${transaction._id}.pdf`;
    const filePath = path.join(__dirname, "../../uploads", fileName);

    // Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, "../../uploads"))) {
      fs.mkdirSync(path.join(__dirname, "../../uploads"), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Content
    doc.fontSize(25).text("Business Sale Agreement", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toDateString()}`);
    doc.moveDown();
    doc.text(`This agreement is made between:`);
    doc.text(`Buyer: ${buyer.profile.name} (${buyer.email})`);
    doc.text(`Seller: ${seller.profile.name} (${seller.email})`);
    doc.moveDown();
    doc.text(`Regarding the sale of business: ${business.title}`);
    doc.text(`Category: ${business.category}`);
    doc.text(`Agreed Price: $${transaction.amount}`);
    doc.moveDown();
    doc.text("Terms and Conditions:");
    doc.text("1. The seller agrees to transfer all assets...");
    doc.text("2. The buyer agrees to pay the amount via Escrow...");
    doc.moveDown();
    doc.text("Signatures:");
    doc.text("________________ (Buyer)");
    doc.text("________________ (Seller)");

    doc.end();

    stream.on("finish", () => {
      // In a real app, upload filePath to Cloudinary and return URL
      // For now, return local path or mock URL
      resolve(`/uploads/${fileName}`);
    });

    stream.on("error", (err) => reject(err));
  });
};
