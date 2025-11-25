import api from "./api";
import { Message, Thread } from "@/types";

// Get all conversation threads
export const getThreads = async (): Promise<Thread[]> => {
  const response = await api.get("/messages/threads/all");
  return response.data;
};

// Get messages for a specific thread
export const getMessages = async (threadId: string): Promise<Message[]> => {
  const response = await api.get(`/messages/thread/${threadId}`);
  return response.data;
};

// Send a message
export const sendMessage = async (data: {
  businessId: string;
  content: string;
  receiverId: string;
}): Promise<Message> => {
  const response = await api.post("/messages", data);
  return response.data;
};

export const startConversation = async (
  businessId: string,
  receiverId: string
): Promise<Thread> => {
  const response = await api.post("/messages/start-conversation", {
    businessId,
    receiverId,
  });
  return response.data;
};
