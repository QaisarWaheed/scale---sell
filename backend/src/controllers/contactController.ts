import { Request, Response } from "express";

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // TODO: Implement email sending logic (e.g., using Nodemailer or SendGrid)
    // For now, we'll just log the message
    console.log("Contact Form Submission:", {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message || "Failed to send message");
  }
};
