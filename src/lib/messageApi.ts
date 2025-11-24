import api from "./api";

// Get all conversation threads
export const getThreads = async () => {
  const response = await api.get("/messages/threads/all");
  return response.data;
};

// Get messages for a specific thread
export const getMessages = async (threadId: string) => {
  const response = await api.get(`/messages/thread/${threadId}`);
  return response.data;
};

// Send a message
export const sendMessage = async (messageData: {
  businessId: string;
  content: string;
  receiverId: string;
}) => {
  const response = await api.post("/messages", messageData);
  return response.data;
};
