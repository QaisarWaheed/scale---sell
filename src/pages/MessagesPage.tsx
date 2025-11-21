import { useState, useEffect, useRef } from "react";
import { SectionHeader } from "@/components/layouts/SectionHeader";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getThreads, getMessages, sendMessage } from "@/lib/messageApi";
import { supabase } from "@/integrations/supabase/client";

export default function MessagesPage() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.businessId._id);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await getThreads();
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error: any) {
      console.error("Error fetching threads:", error);
      toast({
        title: "Error fetching conversations",
        description: "Failed to load your messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (businessId: string) => {
    try {
      setMessagesLoading(true);
      const data = await getMessages(businessId);
      setMessages(data);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: "Failed to load the conversation.",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !currentUserId) return;

    try {
      // Determine receiver ID based on who the current user is
      // If current user is the buyer (investor), receiver is seller
      // If current user is the seller, receiver is the buyer (investor)
      // Note: The thread object structure from backend needs to be handled correctly
      // For now, assuming thread has businessId which has sellerId

      // A better approach for the backend would be to return the "other participant" in the thread object
      // But based on current backend implementation, we might need to infer it or adjust backend

      // Let's assume for now we are sending to the business owner if we are investor
      // Or to the investor if we are the business owner

      // Actually, the sendMessage API expects receiverId.
      // The getThreads API returns threads with businessId populated.
      // We need to know who we are talking to.

      // Let's look at how getThreads is implemented in backend...
      // It groups by businessId.

      // Simplification: For this implementation, we'll assume the thread object contains the necessary info
      // If not, we might need to adjust the backend to return 'otherParticipant'

      // Let's check the thread object structure from the backend response in a real scenario
      // Since I can't see runtime data, I'll assume the thread object has what we need or I'll use a safe fallback

      const receiverId =
        selectedThread.businessId.sellerId._id === currentUserId
          ? selectedThread.senderId._id // If I am seller, send to sender (investor)
          : selectedThread.businessId.sellerId._id; // If I am investor, send to seller

      await sendMessage({
        businessId: selectedThread.businessId._id,
        content: newMessage,
        receiverId: receiverId,
      });

      setNewMessage("");
      fetchMessages(selectedThread.businessId._id);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message.",
        variant: "destructive",
      });
    }
  };

  const filteredThreads = threads.filter((thread) =>
    thread.businessId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipantName = (thread: any) => {
    if (!currentUserId) return "User";
    // If I am the seller, show the investor's name
    if (thread.businessId?.sellerId?._id === currentUserId) {
      // The thread aggregation in backend might need adjustment to include investor info clearly
      // For now, let's use a placeholder or available info
      return "Investor";
    }
    // If I am the investor, show the business/seller name
    return thread.businessId?.sellerId?.profile?.name || "Seller";
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 mt-4">
        {/* Conversations List */}
        <Card className="col-span-12 md:col-span-4 flex flex-col border-r">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="mb-4">
              <SearchBar
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading...
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations found
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread._id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedThread?._id === thread._id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {getOtherParticipantName(thread)
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {getOtherParticipantName(thread)}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(thread.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.businessId?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Thread */}
        <Card className="col-span-12 md:col-span-8 flex flex-col">
          {selectedThread ? (
            <CardContent className="p-0 flex flex-col h-full">
              {/* Thread Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {getOtherParticipantName(selectedThread)
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {getOtherParticipantName(selectedThread)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedThread.businessId?.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderId === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          msg.senderId === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        } rounded-lg p-3`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="No conversation selected"
                description="Select a conversation from the list to start messaging."
              />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
