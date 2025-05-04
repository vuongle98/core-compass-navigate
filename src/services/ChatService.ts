
import { EventEmitter } from '@/lib/EventEmitter';
import { User } from '@/contexts/AuthContext';
import LoggingService from './LoggingService';

export interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  read: boolean;
  chatId: string;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'public';
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

class ChatService extends EventEmitter {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: Message[] = [];
  private chats: Chat[] = [];
  private currentUser: User | null = null;
  
  private mockMessages: Message[] = [];
  private mockChats: Chat[] = [];
  
  constructor() {
    super();
    this.initializeMockData();
  }
  
  private initializeMockData() {
    this.mockChats = [
      {
        id: 'public-general',
        name: 'General',
        type: 'public',
        participants: [
          { id: 'system', name: 'System' },
          { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }
        ],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'group-dev',
        name: 'Development Team',
        type: 'group',
        participants: [
          { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
          { id: 'user3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' },
          { id: 'user4', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=4' }
        ],
        unreadCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'private-user2',
        type: 'private',
        participants: [
          { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }
        ],
        unreadCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.mockMessages = [
      {
        id: 'msg1',
        text: 'Welcome to the General chat!',
        sender: { id: 'system', name: 'System' },
        timestamp: new Date().toISOString(),
        read: true,
        chatId: 'public-general',
        type: 'system'
      },
      {
        id: 'msg2',
        text: 'Hello everyone!',
        sender: { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
        timestamp: new Date().toISOString(),
        read: true,
        chatId: 'public-general',
        type: 'text'
      },
      {
        id: 'msg3',
        text: 'Hi John, how are you?',
        sender: { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
        timestamp: new Date().toISOString(),
        read: true,
        chatId: 'public-general',
        type: 'text'
      }
    ];
    
    this.mockChats = this.mockChats.map(chat => {
      const lastMessage = this.mockMessages
        .filter(msg => msg.chatId === chat.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
      return {
        ...chat,
        lastMessage
      };
    });
    
    this.chats = [...this.mockChats];
    
    LoggingService.info('chat', 'service_initialized', 'Chat service initialized with mock data');
  }

  public connect(user: User, server = 'wss://api.example.com/chat'): void {
    this.currentUser = user;
    
    if (this.isConnected) {
      return;
    }

    try {
      this.socket = new WebSocket(server);
      
      this.socket.onopen = this.handleSocketOpen.bind(this);
      this.socket.onmessage = this.handleSocketMessage.bind(this);
      this.socket.onclose = this.handleSocketClose.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
      
      LoggingService.info('chat', 'connection_attempt', 'Attempting to connect to chat server');
    } catch (error) {
      LoggingService.error('chat', 'connection_failed', 'Failed to connect to chat server', { error });
      this.emit('error', 'Failed to connect to chat server');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
    LoggingService.info('chat', 'disconnected', 'Disconnected from chat server');
  }

  public sendMessage(chatId: string, text: string, type: 'text' | 'image' | 'file' = 'text', metadata?: Record<string, any>): void {
    if (!this.currentUser) {
      this.emit('error', 'User not authenticated');
      LoggingService.error('chat', 'send_message_failed', 'Cannot send message: User not authenticated');
      return;
    }
    
    const message: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: {
        id: this.currentUser.id,
        name: this.currentUser.name,
      },
      timestamp: new Date().toISOString(),
      read: false,
      chatId,
      type,
      metadata
    };
    
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify({
        type: 'message',
        data: message
      }));
      LoggingService.info('chat', 'message_sent', `Message sent to chat ${chatId}`);
    } else {
      this.messageQueue.push(message);
      LoggingService.info('chat', 'message_queued', `Message queued for chat ${chatId} (not connected)`);
    }
    
    this.mockMessages.push(message);
    this.emit('message', message);
    
    this.updateChatWithMessage(chatId, message);
  }

  public getChats(): Chat[] {
    return this.chats;
  }

  public getMessages(chatId: string): Message[] {
    return this.mockMessages
      .filter(message => message.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public createPrivateChat(userId: string, userName: string, userAvatar?: string): Chat {
    const existingChat = this.chats.find(chat => 
      chat.type === 'private' && 
      chat.participants.some(p => p.id === userId)
    );
    
    if (existingChat) {
      LoggingService.info('chat', 'private_chat_exists', `Private chat with user ${userName} already exists`);
      return existingChat;
    }
    
    const newChat: Chat = {
      id: `private-${userId}`,
      type: 'private',
      participants: [
        { id: userId, name: userName, avatar: userAvatar }
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.chats.push(newChat);
    this.emit('chat-created', newChat);
    LoggingService.info('chat', 'private_chat_created', `Created private chat with user ${userName}`);
    
    return newChat;
  }

  public createGroupChat(name: string, participantIds: string[]): Chat {
    // In a real implementation, we would use the participantIds to fetch user details
    // For mock data, we'll use some hardcoded users
    LoggingService.info('chat', 'group_chat_creation_started', 'Creating group chat', { name, participantCount: participantIds.length });
    
    const newChat: Chat = {
      id: `group-${Date.now()}`,
      name,
      type: 'group',
      participants: [
        { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 'user3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' }
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.chats.push(newChat);
    this.emit('chat-created', newChat);
    LoggingService.info('chat', 'group_chat_created', `Created group chat: ${name}`, { chatId: newChat.id });
    
    return newChat;
  }

  public createPublicChat(name: string): Chat {
    LoggingService.info('chat', 'public_chat_creation_started', 'Creating public chat', { name });
    
    const newChat: Chat = {
      id: `public-${Date.now()}`,
      name,
      type: 'public',
      participants: [
        { id: 'system', name: 'System' }
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.chats.push(newChat);
    this.emit('chat-created', newChat);
    LoggingService.info('chat', 'public_chat_created', `Created public chat: ${name}`, { chatId: newChat.id });
    
    return newChat;
  }

  public markAsRead(chatId: string): void {
    this.mockMessages = this.mockMessages.map(message => 
      message.chatId === chatId ? { ...message, read: true } : message
    );
    
    this.chats = this.chats.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    
    this.emit('messages-read', chatId);
    LoggingService.info('chat', 'messages_marked_read', `Marked messages as read for chat ${chatId}`);
  }

  private handleSocketOpen(): void {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    if (this.socket && this.currentUser) {
      this.socket.send(JSON.stringify({
        type: 'auth',
        data: {
          userId: this.currentUser.id,
          token: 'jwt-token-here'
        }
      }));
    }
    
    while (this.messageQueue.length > 0 && this.socket) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.send(JSON.stringify({
          type: 'message',
          data: message
        }));
      }
    }
    
    this.emit('connected');
    LoggingService.info('chat', 'connected', 'Connected to chat server');
  }

  private handleSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          this.handleIncomingMessage(data.data);
          break;
        case 'chat-created':
          this.handleChatCreated(data.data);
          break;
        case 'user-typing':
          this.emit('user-typing', data.data);
          break;
        case 'user-status':
          this.emit('user-status', data.data);
          break;
        default:
          LoggingService.warn('chat', 'unhandled_message_type', 'Unhandled WebSocket message type', { type: data.type });
      }
    } catch (error) {
      LoggingService.error('chat', 'message_handling_failed', 'Error handling WebSocket message', { error });
    }
  }

  private handleSocketClose(event: CloseEvent): void {
    this.isConnected = false;
    this.socket = null;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUser) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      LoggingService.info('chat', 'reconnect_scheduled', `Attempting to reconnect in ${delay}ms`, { attempt: this.reconnectAttempts + 1, maxAttempts: this.maxReconnectAttempts });
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(this.currentUser!);
      }, delay);
    } else {
      this.emit('disconnected');
      LoggingService.warn('chat', 'connection_closed', 'Connection to chat server closed', { code: event.code, reason: event.reason });
    }
  }

  private handleSocketError(event: Event): void {
    LoggingService.error('chat', 'websocket_error', 'WebSocket connection error', { event });
    this.emit('error', 'Connection error');
  }

  private handleIncomingMessage(message: Message): void {
    this.mockMessages.push(message);
    
    this.updateChatWithMessage(message.chatId, message);
    
    this.emit('message', message);
    LoggingService.info('chat', 'message_received', `Message received in chat ${message.chatId}`, { messageId: message.id });
  }

  private handleChatCreated(chat: Chat): void {
    this.chats.push(chat);
    this.emit('chat-created', chat);
    LoggingService.info('chat', 'chat_received', `Chat created: ${chat.name || chat.id}`, { chatId: chat.id, chatType: chat.type });
  }

  private updateChatWithMessage(chatId: string, message: Message): void {
    this.chats = this.chats.map(chat => {
      if (chat.id === chatId) {
        const isFromCurrentUser = this.currentUser && message.sender.id === this.currentUser.id;
        const unreadCount = isFromCurrentUser ? chat.unreadCount : chat.unreadCount + 1;
        
        return {
          ...chat,
          lastMessage: message,
          unreadCount,
          updatedAt: new Date().toISOString()
        };
      }
      return chat;
    });
    
    this.emit('chats-updated', this.chats);
  }
}

const chatService = new ChatService();
export default chatService;
