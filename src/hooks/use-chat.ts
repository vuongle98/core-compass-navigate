
import { useState, useEffect } from 'react';
import chatService, { Chat, Message } from '@/services/ChatService';
import { useAuth } from '@/contexts/AuthContext';
import LoggingService from '@/services/LoggingService';

interface UseChatReturn {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isConnected: boolean;
  sendMessage: (text: string, type?: 'text' | 'image' | 'file') => void;
  selectChat: (chatId: string) => void;
  createPrivateChat: (userId: string, userName: string, userAvatar?: string) => void;
  createGroupChat: (name: string, participantIds: string[]) => void;
  createPublicChat: (name: string) => void;
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
      LoggingService.info('chat', 'initialized', 'Chat hook initialized');
    }

    // Since ChatService extends EventEmitter, we can use addListener
    chatService.addListener('connected', handleConnected);
    chatService.addListener('disconnected', handleDisconnected);
    chatService.addListener('message', handleNewMessage);
    chatService.addListener('chats-updated', handleChatsUpdated);
    chatService.addListener('chat-created', handleChatCreated);
    chatService.addListener('error', handleError);

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
      LoggingService.info('chat', 'disconnected', 'Chat hook cleanup');
    };
  }, [user]);

  // Update messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      const chatMessages = chatService.getMessages(activeChat.id);
      setMessages(chatMessages);
      
      // Mark messages as read
      chatService.markAsRead(activeChat.id);
      LoggingService.info('chat', 'messages_loaded', `Loaded ${chatMessages.length} messages for chat ${activeChat.id}`);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  // Event handlers
  const handleConnected = () => {
    setIsConnected(true);
    setChats(chatService.getChats());
    LoggingService.info('chat', 'connection_established', 'Chat connection established');
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    LoggingService.info('chat', 'connection_closed', 'Chat connection closed');
  };

  const handleNewMessage = (message: Message) => {
    if (activeChat && activeChat.id === message.chatId) {
      setMessages(prevMessages => [...prevMessages, message]);
      LoggingService.info('chat', 'new_message_received', 'New message received for active chat');
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
    LoggingService.info('chat', 'chats_updated', `Chats list updated, now has ${updatedChats.length} chats`);
  };

  const handleChatCreated = (chat: Chat) => {
    setChats(prevChats => [...prevChats, chat]);
    LoggingService.info('chat', 'chat_created_event', `New chat created: ${chat.name || chat.id}`);
  };

  const handleError = (error: string) => {
    LoggingService.error('chat', 'error', 'Chat error:', { error });
    // In a real app, show toast notification
  };

  // Actions
  const sendMessage = (text: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeChat || !text.trim()) {
      return;
    }
    
    chatService.sendMessage(activeChat.id, text);
    LoggingService.info('chat', 'message_sent', `Message sent to chat ${activeChat.id}`);
  };

  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
      chatService.markAsRead(chatId);
      LoggingService.info('chat', 'chat_selected', `Selected chat ${chatId}`);
    }
  };

  const createPrivateChat = (userId: string, userName: string, userAvatar?: string) => {
    const chat = chatService.createPrivateChat(userId, userName, userAvatar);
    setActiveChat(chat);
    LoggingService.info('chat', 'private_chat_created', `Created private chat with user ${userName}`);
  };

  const createGroupChat = (name: string, participantIds: string[]) => {
    const chat = chatService.createGroupChat(name, participantIds);
    setActiveChat(chat);
    LoggingService.info('chat', 'group_chat_created', `Created group chat ${name}`);
  };
  
  const createPublicChat = (name: string) => {
    const chat = chatService.createPublicChat(name);
    setActiveChat(chat);
    LoggingService.info('chat', 'public_chat_created', `Created public chat ${name}`);
  };

  return {
    chats,
    activeChat,
    messages,
    isConnected,
    sendMessage,
    selectChat,
    createPrivateChat,
    createGroupChat,
    createPublicChat
  };
}
