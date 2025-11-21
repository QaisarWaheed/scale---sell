import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Message from "../models/Message";
import mongoose from "mongoose";

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, businessId, content } = req.body;

    const message = await Message.create({
      senderId: req.user?._id,
      receiverId,
      businessId,
      content,
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get messages for a business thread
// @route   GET /api/messages/:businessId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find({
      businessId: req.params.businessId,
      $or: [{ senderId: req.user?._id }, { receiverId: req.user?._id }],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "profile.name")
      .populate("receiverId", "profile.name");

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations (threads)
// @route   GET /api/messages/threads/all
// @access  Private
export const getThreads = async (req: AuthRequest, res: Response) => {
  try {
    // Aggregate to find unique business threads
    const threads = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: req.user?._id }, { receiverId: req.user?._id }],
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $group: {
          _id: "$businessId",
          lastMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: "$business" },
    ]);

    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
