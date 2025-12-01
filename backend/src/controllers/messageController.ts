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

    // Convert receiverId to ObjectId if it's a string
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    
    // Find or create thread with consistent ObjectId sorting
    const participants = [senderId, receiverObjectId].sort((a, b) => 
      a.toString().localeCompare(b.toString())
    );
    
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
          [receiverObjectId.toString()]: 0,
        },
      });
    }

    // Create message
    const message = await Message.create({
      threadId: thread._id,
      senderId,
      receiverId: receiverObjectId,
      businessId,
      content,
    });

    // Update thread's last message and unread count
    thread.lastMessage = message._id;
    const currentUnreads = thread.unreadCounts.get(receiverObjectId.toString()) || 0;
    thread.unreadCounts.set(receiverObjectId.toString(), currentUnreads + 1);
    await thread.save();

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
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
    const thread = await Thread.findById(threadId).populate('businessId');
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Check if thread has valid businessId
    if (!thread.businessId) {
      console.error(`Thread ${threadId} has null businessId - invalid thread`);
      return res.status(400).json({ 
        message: "This conversation is invalid. Please start a new conversation from the listing page.",
        invalidThread: true
      });
    }

    const userId = req.user?._id?.toString();
    const participantIds = thread.participants.map((p) => p.toString());
    
    console.log(`Checking thread access: User ${userId}, Participants:`, participantIds);
    
    if (!participantIds.includes(userId || '')) {
      // Log unauthorized access attempt for security audit
      console.warn(
        `Unauthorized thread access attempt: User ${userId} tried to access thread ${threadId}`,
        `Thread participants: ${participantIds.join(', ')}`
      );
      return res
        .status(403)
        .json({ message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .populate("senderId", "profile.name supabaseId email")
      .populate("receiverId", "profile.name supabaseId email");

    // Mark messages as read
    await Message.updateMany(
      { threadId, receiverId: req.user?._id, read: false },
      { read: true }
    );

    // Reset unread count for this user
    if (userId) {
      thread.unreadCounts.set(userId, 0);
      await thread.save();
    }

    res.json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
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
        select: "profile.name email supabaseId",
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId",
      })
      .sort({ updatedAt: -1 });

    res.json(threads);
  } catch (error: any) {
    console.error("Error fetching threads:", error);
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

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    
    // Prevent self-conversation
    if (senderId.toString() === receiverObjectId.toString()) {
      return res.status(400).json({ message: "Cannot start conversation with yourself" });
    }
    
    const participants = [senderId, receiverObjectId].sort((a, b) => 
      a.toString().localeCompare(b.toString())
    );

    console.log('Starting conversation:', {
      senderId: senderId.toString(),
      receiverId: receiverObjectId.toString(),
      businessId,
      participants: participants.map(p => p.toString())
    });

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
          [receiverObjectId.toString()]: 0,
        },
      });
      console.log('Created new thread:', thread._id);
    } else {
      console.log('Found existing thread:', thread._id);
    }

    res.status(200).json(thread);
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    res.status(400).json({ message: error.message });
  }
};
