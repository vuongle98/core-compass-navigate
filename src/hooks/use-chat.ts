
import { useState, useEffect } from 'react';
import chatService, { Chat, Message } from '@/services/ChatService';
import { useAuth } from '@/contexts/AuthContext';

interface UseChatReturn {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isConnected: boolean;
  sendMessage: (text: string, type?: 'text' | 'image' | 'file') => void;
  selectChat: (chatId: string) => void;
  createPrivateChat: (userId: string, userName: string, userAvatar?: string) => void;
  createGroupChat: (name: string, participantIds: string[]) => void;
}

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Connect to chat service when user is available
  useEffect(() => {
    if (user) {
      // In a real implementation, connect to the WebSocket server
      // chatService.connect(user);
      
      // For demo, just fetch chats
      setChats(chatService.getChats());
      setIsConnected(true);
    }

    // Event listeners
    chatService.on('connected', handleConnected);
    chatService.on('disconnected', handleDisconnected);
    chatService.on('message', handleNewMessage);
    chatService.on('chats-updated', handleChatsUpdated);
    chatService.on('chat-created', handleChatCreated);
    chatService.on('error', handleError);

    return () => {
      // Clean up event listeners
      chatService.removeListener('connected', handleConnected);
      chatService.removeListener('disconnected', handleDisconnected);
      chatService.removeListener('message', handleNewMessage);
      chatService.removeListener('chats-updated', handleChatsUpdated);
      chatService.removeListener('chat-created', handleChatCreated);
      chatService.removeListener('error', handleError);
      
      // Disconnect from service
      // chatService.disconnect();
    };
  }, [user]);

  // Update messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      const chatMessages = chatService.getMessages(activeChat.id);
      setMessages(chatMessages);
      
      // Mark messages as read
      chatService.markAsRead(activeChat.id);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  // Event handlers
  const handleConnected = () => {
    setIsConnected(true);
    setChats(chatService.getChats());
  };

  const handleDisconnected = () => {
    setIsConnected(false);
  };

  const handleNewMessage = (message: Message) => {
    if (activeChat && activeChat.id === message.chatId) {
      setMessages(prevMessages => [...prevMessages, message]);
    }
  };

  const handleChatsUpdated = (updatedChats: Chat[]) => {
    setChats(updatedChats);
    
    // Update active chat if it's in the updated list
    if (activeChat) {
      const updatedActiveChat = updatedChats.find(chat => chat.id === activeChat.id);
      if (updatedActiveChat) {
        setActiveChat(updatedActiveChat);
      }
    }
  };

  const handleChatCreated = (chat: Chat) => {
    setChats(prevChats => [...prevChats, chat]);
  };

  const handleError = (error: string) => {
    console.error('Chat error:', error);
    // In a real app, show toast notification
  };

  // Actions
  const sendMessage = (text: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeChat || !text.trim()) {
      return;
    }
    
    chatService.sendMessage(activeChat.id, text, type);
  };

  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
      chatService.markAsRead(chatId);
    }
  };

  const createPrivateChat = (userId: string, userName: string, userAvatar?: string) => {
    const chat = chatService.createPrivateChat(userId, userName, userAvatar);
    setActiveChat(chat);
  };

  const createGroupChat = (name: string, participantIds: string[]) => {
    const chat = chatService.createGroupChat(name, participantIds);
    setActiveChat(chat);
  };

  return {
    chats,
    activeChat,
    messages,
    isConnected,
    sendMessage,
    selectChat,
    createPrivateChat,
    createGroupChat
  };
}
