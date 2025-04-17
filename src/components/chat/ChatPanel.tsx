
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChat } from '@/hooks/use-chat';
import { Send, Users, User, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import ChatMessage from './ChatMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAnimationClass } from '@/lib/animation';

interface ChatPanelProps {
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { chats, activeChat, messages, sendMessage, selectChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isPrivateMessagingEnabled = useFeatureFlag('private_messaging');
  const isGroupChatEnabled = useFeatureFlag('group_chat');
  const [activeTab, setActiveTab] = useState<string>('public');
  
  const publicChats = chats.filter(chat => chat.type === 'public');
  const privateChats = chats.filter(chat => chat.type === 'private');
  const groupChats = chats.filter(chat => chat.type === 'group');
  
  // Auto-select the first chat in the active tab if no chat is selected
  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      const tabChats = chats.filter(chat => chat.type === activeTab);
      if (tabChats.length > 0) {
        selectChat(tabChats[0].id);
      }
    }
  }, [activeTab, chats, activeChat, selectChat]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && activeChat) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);
  };
  
  const renderChatList = (chatList: typeof chats) => {
    return chatList.map(chat => {
      // For private chats, show the other participant's name
      const chatName = chat.type === 'private' 
        ? chat.participants[0]?.name 
        : chat.name || 'Unnamed Chat';
        
      const unreadIndicator = chat.unreadCount > 0 
        ? <span className="bg-primary rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
            {chat.unreadCount}
          </span>
        : null;
        
      const isActive = activeChat?.id === chat.id;
      
      return (
        <div 
          key={chat.id}
          onClick={() => handleChatSelect(chat.id)}
          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
            isActive ? 'bg-accent' : 'hover:bg-accent/50'
          }`}
        >
          {chat.type === 'private' && (
            <Avatar>
              <AvatarImage src={chat.participants[0]?.avatar} />
              <AvatarFallback>{chatName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          
          {chat.type === 'group' && (
            <Avatar>
              <AvatarFallback><Users size={16} /></AvatarFallback>
            </Avatar>
          )}
          
          {chat.type === 'public' && (
            <Avatar>
              <AvatarFallback><Globe size={16} /></AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{chatName}</span>
              {unreadIndicator}
            </div>
            {chat.lastMessage && (
              <span className="text-xs text-muted-foreground truncate">
                {chat.lastMessage.sender.name}: {chat.lastMessage.text}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  const messageAnimation = getAnimationClass({
    type: 'fade-in',
    duration: 300,
  });

  return (
    <Card className="shadow-lg border-2 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Chat</span>
        </CardTitle>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="public">Public</TabsTrigger>
            {isPrivateMessagingEnabled && <TabsTrigger value="private">Private</TabsTrigger>}
            {isGroupChatEnabled && <TabsTrigger value="group">Groups</TabsTrigger>}
          </TabsList>

          <div className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex h-full">
              {/* Chat List */}
              <div className="w-1/3 border-r p-2 overflow-y-auto">
                <TabsContent value="public" className="m-0">
                  {renderChatList(publicChats)}
                </TabsContent>
                
                <TabsContent value="private" className="m-0">
                  {isPrivateMessagingEnabled ? (
                    renderChatList(privateChats)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      Private messaging is disabled
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="group" className="m-0">
                  {isGroupChatEnabled ? (
                    renderChatList(groupChats)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      Group chat is disabled
                    </div>
                  )}
                </TabsContent>
              </div>
              
              {/* Chat Messages */}
              <div className="w-2/3 flex flex-col h-full overflow-hidden">
                {activeChat ? (
                  <>
                    <div className="p-2 border-b">
                      <span className="font-medium">
                        {activeChat.type === 'private' 
                          ? activeChat.participants[0]?.name 
                          : activeChat.name || 'Chat'}
                      </span>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div key={message.id} className={messageAnimation}>
                            <ChatMessage 
                              message={message} 
                              isCurrentUser={message.sender.id === user?.id} 
                            />
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </CardHeader>

      <CardFooter className="p-3">
        {activeChat && (
          <form onSubmit={handleSend} className="flex w-full gap-2">
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
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChatPanel;
