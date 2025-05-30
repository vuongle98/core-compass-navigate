import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@/hooks/use-chat";
import {
  Send,
  Users,
  Globe,
  Plus,
  Search,
  Smile,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import ChatMessage from "./ChatMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAnimationClass } from "@/lib/animation";
import CreateChatDialog from "./CreateChatDialog";
import LoggingService from "@/services/LoggingService";
import { Chat } from "@/services/ChatService";

interface ChatPanelProps {
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { chats, activeChat, messages, sendMessage, selectChat } = useChat();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isPrivateMessagingEnabled = useFeatureFlag("private_messaging");
  const isGroupChatEnabled = useFeatureFlag("group_chat");
  const [activeTab, setActiveTab] = useState<string>("public");
  const [showChatList, setShowChatList] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats by type
  const publicChats = chats.filter((chat) => chat.type === "public");
  const privateChats = chats.filter((chat) => chat.type === "private");
  const groupChats = chats.filter((chat) => chat.type === "group");

  // Filter chats based on search term
  const filteredPublicChats = publicChats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredPrivateChats = privateChats.filter((chat) =>
    chat.participants.some((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredGroupChats = groupChats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Auto-select the first chat in the active tab if no chat is selected
  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      const tabChats = chats.filter((chat) => chat.type === activeTab);
      if (tabChats.length > 0) {
        selectChat(tabChats[0].id);
      }
    }
  }, [activeTab, chats, activeChat, selectChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && activeChat) {
      sendMessage(inputValue);
      setInputValue("");

      LoggingService.info("chat", "message_sent_ui", "User sent a message", {
        chatId: activeChat.id,
        chatType: activeChat.type,
      });
    }
  };

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);

    LoggingService.info("chat", "chat_selected", "User selected a chat", {
      chatId,
    });

    // On mobile, automatically switch to chat view after selection
    if (window.innerWidth < 768) {
      setShowChatList(false);
    }
  };

  const handleCreateChat = () => {
    setIsCreateDialogOpen(true);
    LoggingService.info(
      "chat",
      "create_chat_dialog_opened",
      "User opened create chat dialog"
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    LoggingService.info("chat", "chat_search", "User searched for chats", {
      searchTerm: e.target.value,
    });
  };

  const renderChatList = (chatList: Chat[]) => {
    if (chatList.length === 0) {
      return (
        <div className="p-3 text-center text-sm text-muted-foreground">
          No chats found
          <Button
            variant="link"
            size="sm"
            onClick={handleCreateChat}
            className="ml-1 p-0"
          >
            Create one?
          </Button>
        </div>
      );
    }

    return chatList.map((chat) => {
      // For private chats, show the other participant's name
      const chatName =
        chat.type === "private"
          ? chat.participants.find((p) => p.id !== user?.id?.toString())
              ?.name || "Private Chat"
          : chat.name || "Unnamed Chat";

      const unreadIndicator =
        chat.unreadCount > 0 ? (
          <span className="bg-primary rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
            {chat.unreadCount}
          </span>
        ) : null;

      const isActive = activeChat?.id === chat.id;

      return (
        <div
          key={chat.id}
          onClick={() => handleChatSelect(chat.id)}
          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer mb-1 transition-all duration-200 ${
            isActive ? "bg-accent shadow-sm" : "hover:bg-accent/50"
          }`}
        >
          {chat.type === "private" && (
            <Avatar className="border border-primary/10">
              <AvatarImage
                src={
                  chat.participants.find((p) => p.id !== user?.id?.toString())
                    ?.avatar
                }
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {chatName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {chat.type === "group" && (
            <Avatar className="border border-accent/20">
              <AvatarFallback className="bg-accent/10">
                <Users size={16} />
              </AvatarFallback>
            </Avatar>
          )}

          {chat.type === "public" && (
            <Avatar className="border border-accent/20">
              <AvatarFallback className="bg-accent/10">
                <Globe size={16} />
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span
                className={`font-medium truncate ${
                  isActive ? "text-primary" : ""
                }`}
              >
                {chatName}
              </span>
              {unreadIndicator}
            </div>
            {chat.latestMessage && (
              <span className="text-xs text-muted-foreground truncate">
                {chat.latestMessage.sender.name}: {chat.latestMessage.text}
              </span>
            )}
          </div>
          {isActive && <ArrowRight size={16} className="text-primary" />}
        </div>
      );
    });
  };

  const messageAnimation = getAnimationClass({
    type: "fade-in",
    duration: 300,
  });

  return (
    <>
      <Card className="shadow-lg border-2 h-full flex flex-col rounded-xl overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Chat</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="public">Public</TabsTrigger>
              {isPrivateMessagingEnabled && (
                <TabsTrigger value="private">Private</TabsTrigger>
              )}
              {isGroupChatEnabled && (
                <TabsTrigger value="group">Groups</TabsTrigger>
              )}
            </TabsList>
          </CardHeader>

          <div className="flex-1 flex overflow-hidden">
            <CardContent className="p-0 flex-1 flex">
              <div className="flex h-full w-full relative">
                {/* Mobile toggle for chat list/detail view */}
                {activeChat && (
                  <div className="md:hidden absolute top-2 left-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChatList(!showChatList)}
                      className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      {showChatList ? (
                        <ArrowRight className="h-4 w-4" />
                      ) : (
                        <ArrowLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Chat List - hidden on mobile when showing chat details */}
                <div
                  className={`${
                    showChatList ? "flex flex-col" : "hidden"
                  } md:flex md:flex-col w-full md:w-1/3 border-r overflow-hidden`}
                >
                  <div className="p-3 flex items-center justify-between border-b">
                    <h3 className="font-medium text-sm">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                      Chats
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={handleCreateChat}
                      aria-label="Create new chat"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>

                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8 h-9"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <TabsContent value="public" className="mt-0 p-3">
                      {renderChatList(filteredPublicChats)}
                    </TabsContent>

                    <TabsContent value="private" className="mt-0 p-3">
                      {isPrivateMessagingEnabled ? (
                        renderChatList(filteredPrivateChats)
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          Private messaging is disabled
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="group" className="mt-0 p-3">
                      {isGroupChatEnabled ? (
                        renderChatList(filteredGroupChats)
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          Group chat is disabled
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </div>

                {/* Chat Messages - hidden on mobile when showing chat list */}
                <div
                  className={`${
                    !showChatList ? "flex flex-col" : "hidden"
                  } md:flex md:flex-col w-full md:w-2/3 h-full overflow-hidden`}
                >
                  {activeChat ? (
                    <>
                      <div className="p-3 border-b flex items-center gap-2">
                        {activeChat.type === "private" && (
                          <Avatar className="h-8 w-8 border border-primary/10">
                            <AvatarImage
                              src={
                                activeChat.participants.find(
                                  (p) => p.id !== user?.id?.toString()
                                )?.avatar
                              }
                            />
                            <AvatarFallback className="bg-primary/10 text-xs">
                              {activeChat.participants
                                .find((p) => p.id !== user?.id?.toString())
                                ?.name.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {activeChat.type === "group" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Users size={14} />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {activeChat.type === "public" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Globe size={14} />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <span className="font-medium">
                          {activeChat.type === "private"
                            ? activeChat.participants.find(
                                (p) => p.id !== user?.id?.toString()
                              )?.name
                            : activeChat.name || "Chat"}
                        </span>
                      </div>
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div key={message.id} className={messageAnimation}>
                              <ChatMessage
                                message={message}
                                isCurrentUser={
                                  message.sender.id === user?.id?.toString()
                                }
                              />
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      <CardFooter className="p-3 pt-2 border-t">
                        <form
                          onSubmit={handleSend}
                          className="flex w-full gap-2 items-center"
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-full flex-shrink-0"
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                          <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!inputValue.trim()}
                            className="h-9 px-3 rounded-full flex-shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardFooter>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col p-4">
                      <Globe className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-center">
                        Select a chat to start messaging
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleCreateChat}
                      >
                        <Plus className="mr-2 h-4 w-4" /> New Conversation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Tabs>
      </Card>

      <CreateChatDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </>
  );
};

export default ChatPanel;
