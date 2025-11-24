import { useState, useEffect, useRef, useCallback } from "react";
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
import { getErrorMessage } from "@/lib/utils";
import { Thread, Message, User, BusinessListing } from "@/types";

export default function MessagesPage() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getThreads();
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast({
        title: "Error fetching conversations",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedThread]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
    fetchThreads();
  }, [fetchThreads]);

  const fetchMessages = useCallback(
    async (threadId: string) => {
      try {
        setMessagesLoading(true);
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
        setMessagesLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread._id);
    }
  }, [selectedThread, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !currentUserId) return;

    try {
      // Get the other participant (not the current user)
      const otherParticipant = selectedThread.participants.find((p) => {
        const participantId = typeof p === "object" ? p._id : p;
        return participantId !== currentUserId;
      });

      if (!otherParticipant) {
        toast({
          title: "Error",
          description: "Could not find recipient",
          variant: "destructive",
        });
        return;
      }

      const receiverId =
        typeof otherParticipant === "object"
          ? otherParticipant._id
          : otherParticipant;

      const business = selectedThread.businessId as BusinessListing;

      await sendMessage({
        businessId: business._id,
        content: newMessage,
        receiverId,
      });

      setNewMessage("");
      fetchMessages(selectedThread._id);
      fetchThreads(); // Refresh threads to update last message
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const filteredThreads = threads.filter((thread) => {
    const business = thread.businessId as BusinessListing;
    return business?.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipantName = (thread: Thread) => {
    if (!currentUserId) return "User";

    // Find the participant who is NOT the current user
    const otherParticipant = thread.participants.find((p) => {
      const participantId = typeof p === "object" ? p._id : p;
      return participantId !== currentUserId;
    });

    if (!otherParticipant) return "User";

    if (typeof otherParticipant === "object") {
      return otherParticipant.profile?.name || otherParticipant.email || "User";
    }

    return "User";
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
                          {(thread.businessId as BusinessListing)?.title}
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
                    <p className="text-sm text-muted-foreground">
                      {(selectedThread.businessId as BusinessListing)?.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No messages yet"
                    description="Start the conversation by sending a message."
                  />
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId === currentUserId;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-[10px] opacity-70 mt-1 block">
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
