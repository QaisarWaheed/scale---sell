import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Thread, Message, BusinessListing } from "@/types";
import { getThreads, getMessages, sendMessage as apiSendMessage } from "@/lib/messageApi";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

interface ChatContextType {
  threads: Thread[];
  selectedThread: Thread | null;
  messages: Message[];
  loadingThreads: boolean;
  loadingMessages: boolean;
  setSelectedThread: (thread: Thread | null) => void;
  sendMessage: (content: string) => Promise<void>;
  refreshThreads: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  currentUserId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      setLoadingThreads(true);
      const data = await getThreads();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast({
        title: "Error fetching conversations",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoadingThreads(false);
    }
  }, [toast]);

  // Fetch messages for selected thread
  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      setLoadingMessages(true);
      const data = await getMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: "Failed to load the conversation.",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    if (currentUserId) {
      fetchThreads();
    }
  }, [currentUserId, fetchThreads]);

  // Fetch messages when selected thread changes
  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread._id);
    } else {
      setMessages([]);
    }
  }, [selectedThread, fetchMessages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedThread || !currentUserId) return;

    try {
      const otherParticipant = selectedThread.participants.find((p) => {
        if (typeof p === "object") {
          return p.supabaseId !== currentUserId;
        }
        return p !== currentUserId;
      });

      if (!otherParticipant) {
        throw new Error("Could not find recipient");
      }

      const receiverId = typeof otherParticipant === "object" ? otherParticipant._id : otherParticipant;
      const business = selectedThread.businessId as BusinessListing;

      await apiSendMessage({
        businessId: business._id,
        content,
        receiverId,
      });

      // Refresh messages and threads (to update last message preview)
      await fetchMessages(selectedThread._id);
      fetchThreads();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        selectedThread,
        messages,
        loadingThreads,
        loadingMessages,
        setSelectedThread,
        sendMessage: handleSendMessage,
        refreshThreads: fetchThreads,
        refreshMessages: () => selectedThread ? fetchMessages(selectedThread._id) : Promise.resolve(),
        currentUserId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
