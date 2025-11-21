import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare, Send, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Mock data
const mockConversations = [
  {
    id: 1,
    name: "John Investor",
    lastMessage: "Interested in your SaaS business",
    time: "2h ago",
    unread: 2,
    avatar: "JI",
  },
  {
    id: 2,
    name: "Sarah Seller",
    lastMessage: "Can we schedule a call?",
    time: "5h ago",
    unread: 0,
    avatar: "SS",
  },
  {
    id: 3,
    name: "Mike Admin",
    lastMessage: "Your listing has been approved",
    time: "1d ago",
    unread: 0,
    avatar: "MA",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "John Investor",
    content: "Hi, I'm interested in your SaaS business listing",
    time: "2:30 PM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Great! I'd be happy to discuss the details",
    time: "2:35 PM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "John Investor",
    content: "What's the current MRR?",
    time: "2:40 PM",
    isOwn: false,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    mockConversations[0]
  );
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Messages"
        subtitle="Communicate with buyers, sellers, and admins"
      />

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Conversations List */}
        <Card className="col-span-4 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation.id === conv.id
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center">
                      <span className="text-sm font-medium">{conv.avatar}</span>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {conv.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Thread */}
        <Card className="col-span-8 flex flex-col">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Thread Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {selectedConversation.avatar}
                  </span>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.name}</h3>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-lg p-3`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setMessage("");
                    }
                  }}
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
