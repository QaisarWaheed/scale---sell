import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Message from "../models/Message";
import Thread from "../models/Thread";
import mongoose from "mongoose";

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, businessId, content } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find or create thread
    const participants = [senderId, receiverId].sort(); // Sort to ensure consistent ordering
    let thread = await Thread.findOne({
      businessId,
      participants: { $all: participants, $size: 2 },
    });

    if (!thread) {
      thread = await Thread.create({
        businessId,
        participants,
        unreadCounts: {
          [senderId.toString()]: 0,
          [receiverId]: 0,
        },
      });
    }

    // Create message
    const message = await Message.create({
      threadId: thread._id,
      senderId,
      receiverId,
      businessId,
      content,
    });

    // Update thread's last message and unread count
    thread.lastMessage = message._id;
    const currentUnreads = thread.unreadCounts.get(receiverId) || 0;
    thread.unreadCounts.set(receiverId, currentUnreads + 1);
    await thread.save();

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get messages for a thread
// @route   GET /api/messages/thread/:threadId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { threadId } = req.params;

    // Verify user is part of this thread
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const userId = req.user?._id?.toString();
    if (!thread.participants.some((p) => p.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this thread" });
    }

    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .populate("senderId", "profile.name")
      .populate("receiverId", "profile.name");

    // Mark messages as read
    await Message.updateMany(
      { threadId, receiverId: userId, read: false },
      { read: true }
    );

    // Reset unread count for this user
    if (userId) {
      thread.unreadCounts.set(userId, 0);
      await thread.save();
    }

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversation threads for current user
// @route   GET /api/messages/threads/all
// @access  Private
export const getThreads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const threads = await Thread.find({
      participants: userId,
    })
      .populate("businessId")
      .populate({
        path: "participants",
        select: "profile.name email",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId",
      })
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a business (legacy - for backward compatibility)
// @route   GET /api/messages/:businessId
// @access  Private
export const getMessagesByBusiness = async (
  req: AuthRequest,
  res: Response
) => {
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

// @desc    Start a conversation (or get existing)
// @route   POST /api/messages/start-conversation
// @access  Private
export const startConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { businessId, receiverId } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const participants = [senderId, receiverId].sort();

    let thread = await Thread.findOne({
      businessId,
      participants: { $all: participants, $size: 2 },
    });

    if (!thread) {
      thread = await Thread.create({
        businessId,
        participants,
        unreadCounts: {
          [senderId.toString()]: 0,
          [receiverId]: 0,
        },
      });
    }

    res.status(200).json(thread);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
