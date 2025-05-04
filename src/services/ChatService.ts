
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import LoggingService from './LoggingService';
import ServiceRegistry from './ServiceRegistry';

// Define message sender type
export interface MessageSender {
  id: string;
  name: string;
  avatar?: string;
}

// Define message type
export interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  metadata?: Record<string, any>;
}

// Define chat type
export interface Chat {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'public';
  participants: MessageSender[];
  unreadCount: number;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for chat functionality
 */
class ChatService extends EventEmitter {
  private chats: Chat[] = [];
  private messages: Record<string, Message[]> = {};
  private currentUser: MessageSender | null = null;
  private isConnected = false;
  private static instance: ChatService;

  private constructor() {
    super();
    this.initializeMockData();
    LoggingService.info('chat', 'service_initialized', 'Chat service initialized');
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Get all chats for the current user
   */
  public getChats(): Chat[] {
    LoggingService.info('chat', 'get_chats', `Retrieved ${this.chats.length} chats`);
    return this.chats;
  }

  /**
   * Get messages for a specific chat
   */
  public getMessages(chatId: string): Message[] {
    const chatMessages = this.messages[chatId] || [];
    LoggingService.info('chat', 'get_messages', `Retrieved ${chatMessages.length} messages for chat ${chatId}`);
    return chatMessages;
  }

  /**
   * Connect to the chat service
   */
  public connect(user: any): void {
    this.currentUser = {
      id: String(user.id),
      name: user.name || user.email || 'Anonymous User',
      avatar: user.avatar,
    };
    
    this.isConnected = true;
    this.emit('connected');
    
    LoggingService.info('chat', 'connect', 'User connected to chat', { userId: user.id });
    
    // Mock receiving a message after connection
    setTimeout(() => {
      if (this.chats.length > 0) {
        const publicChat = this.chats.find(chat => chat.type === 'public');
        if (publicChat) {
          this.receiveMessage({
            id: uuidv4(),
            chatId: publicChat.id,
            text: 'Welcome to the chat! How can I help you today?',
            sender: {
              id: 'system',
              name: 'System',
              avatar: '/assets/system-avatar.png',
            },
            timestamp: new Date().toISOString(),
            type: 'text',
            isRead: false,
          });
        }
      }
    }, 1000);
  }

  /**
   * Disconnect from the chat service
   */
  public disconnect(): void {
    this.isConnected = false;
    this.emit('disconnected');
    LoggingService.info('chat', 'disconnect', 'User disconnected from chat');
  }

  /**
   * Send a message to a chat
   */
  public sendMessage(chatId: string, text: string, type: 'text' | 'image' | 'file' = 'text'): void {
    if (!this.isConnected || !this.currentUser) {
      LoggingService.warn('chat', 'send_message_failed', 'Cannot send message: not connected');
      return;
    }

    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      LoggingService.warn('chat', 'send_message_failed', `Chat ${chatId} not found`);
      return;
    }

    const message: Message = {
      id: uuidv4(),
      chatId,
      text,
      sender: this.currentUser,
      timestamp: new Date().toISOString(),
      type,
      isRead: true,
    };

    // Add to messages
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(message);

    // Update chat
    chat.lastMessage = message;
    chat.updatedAt = message.timestamp;
    
    // Notify listeners
    this.emit('message', message);
    
    LoggingService.info('chat', 'send_message', `Message sent to chat ${chatId}`);
    
    // Mock response
    this.mockResponse(chatId);
  }

  /**
   * Create a private chat with another user
   */
  public createPrivateChat(userId: string, userName: string, userAvatar?: string): Chat {
    if (!this.currentUser) {
      LoggingService.warn('chat', 'create_chat_failed', 'Cannot create chat: not connected');
      throw new Error('Not connected');
    }

    // Check if chat already exists
    const existingChat = this.chats.find(c => 
      c.type === 'private' && 
      c.participants.some(p => p.id === userId)
    );

    if (existingChat) {
      LoggingService.info('chat', 'chat_exists', `Private chat with user ${userId} already exists`);
      return existingChat;
    }

    const chat: Chat = {
      id: uuidv4(),
      type: 'private',
      participants: [
        {
          id: userId,
          name: userName,
          avatar: userAvatar,
        }
      ],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.chats.push(chat);
    this.messages[chat.id] = [];
    
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.chats);
    
    LoggingService.info('chat', 'create_private_chat', `Created private chat with user ${userId}`);
    
    return chat;
  }

  /**
   * Create a group chat
   */
  public createGroupChat(name: string, participantIds: string[]): Chat {
    if (!this.currentUser) {
      LoggingService.warn('chat', 'create_chat_failed', 'Cannot create chat: not connected');
      throw new Error('Not connected');
    }
    
    // Generate random participants
    const participants = participantIds.map(id => ({
      id,
      name: `User ${id.substring(0, 5)}`,
      avatar: `/assets/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
    }));
    
    // Add current user if not already included
    if (!participants.some(p => p.id === this.currentUser?.id) && this.currentUser) {
      participants.push(this.currentUser);
    }

    const chat: Chat = {
      id: uuidv4(),
      name,
      type: 'group',
      participants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.chats.push(chat);
    this.messages[chat.id] = [];
    
    // Add system message
    const systemMessage: Message = {
      id: uuidv4(),
      chatId: chat.id,
      text: `Group "${name}" created`,
      sender: {
        id: 'system',
        name: 'System',
      },
      timestamp: new Date().toISOString(),
      type: 'system',
      isRead: true,
    };
    this.messages[chat.id].push(systemMessage);
    
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.chats);
    
    LoggingService.info('chat', 'create_group_chat', `Created group chat "${name}" with ${participants.length} participants`);
    
    return chat;
  }

  /**
   * Create a public chat
   */
  public createPublicChat(name: string): Chat {
    if (!this.currentUser) {
      LoggingService.warn('chat', 'create_chat_failed', 'Cannot create chat: not connected');
      throw new Error('Not connected');
    }

    const chat: Chat = {
      id: uuidv4(),
      name,
      type: 'public',
      participants: [this.currentUser],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.chats.push(chat);
    this.messages[chat.id] = [];
    
    // Add system message
    const systemMessage: Message = {
      id: uuidv4(),
      chatId: chat.id,
      text: `Public chat "${name}" created`,
      sender: {
        id: 'system',
        name: 'System',
      },
      timestamp: new Date().toISOString(),
      type: 'system',
      isRead: true,
    };
    this.messages[chat.id].push(systemMessage);
    
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.chats);
    
    LoggingService.info('chat', 'create_public_chat', `Created public chat "${name}"`);
    
    return chat;
  }

  /**
   * Mark messages in a chat as read
   */
  public markAsRead(chatId: string): void {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) {
      return;
    }

    // Update unread count
    if (chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this.emit('chats-updated', this.chats);
    }

    // Mark messages as read
    const chatMessages = this.messages[chatId] || [];
    let updated = false;
    
    chatMessages.forEach(message => {
      if (!message.isRead && message.sender.id !== this.currentUser?.id) {
        message.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      this.emit('messages-updated', chatId, chatMessages);
    }
    
    LoggingService.info('chat', 'mark_as_read', `Marked messages as read in chat ${chatId}`);
  }

  /**
   * Receive a message (internal method)
   */
  private receiveMessage(message: Message): void {
    const chatId = message.chatId;
    const chat = this.chats.find(c => c.id === chatId);
    
    if (!chat) {
      LoggingService.warn('chat', 'receive_message_failed', `Chat ${chatId} not found`);
      return;
    }

    // Add to messages
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(message);

    // Update chat
    chat.lastMessage = message;
    chat.updatedAt = message.timestamp;
    
    // Increment unread count if not from current user
    if (message.sender.id !== this.currentUser?.id) {
      chat.unreadCount += 1;
    }

    // Notify listeners
    this.emit('message', message);
    this.emit('chats-updated', this.chats);
    
    LoggingService.info('chat', 'receive_message', `Message received in chat ${chatId}`);
  }

  /**
   * Mock receiving a response after a delay
   */
  private mockResponse(chatId: string): void {
    setTimeout(() => {
      const chat = this.chats.find(c => c.id === chatId);
      if (!chat) return;

      const responses = [
        'That sounds interesting!',
        'I understand what you mean.',
        'Could you tell me more about that?',
        'Thanks for sharing that information.',
        'I'm not sure I follow. Can you explain?',
        'That's a great point!',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Select a random participant as the responder
      let responder;
      if (chat.type === 'private') {
        responder = chat.participants[0];
      } else {
        const otherParticipants = chat.participants.filter(p => p.id !== this.currentUser?.id);
        if (otherParticipants.length > 0) {
          responder = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        } else {
          // Use system if no other participants
          responder = {
            id: 'system',
            name: 'System',
          };
        }
      }

      this.receiveMessage({
        id: uuidv4(),
        chatId,
        text: randomResponse,
        sender: responder,
        timestamp: new Date().toISOString(),
        type: 'text',
        isRead: false,
      });
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  /**
   * Initialize with some mock data
   */
  private initializeMockData(): void {
    // Generate mock chats
    const generalChat: Chat = {
      id: uuidv4(),
      name: 'General',
      type: 'public',
      participants: [
        { id: 'system', name: 'System' },
        { id: 'user-1', name: 'John Smith', avatar: '/assets/avatar-1.png' },
        { id: 'user-2', name: 'Jane Doe', avatar: '/assets/avatar-2.png' },
      ],
      unreadCount: 2,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supportChat: Chat = {
      id: uuidv4(),
      name: 'Support',
      type: 'public',
      participants: [
        { id: 'system', name: 'System' },
        { id: 'support-1', name: 'Support Team', avatar: '/assets/avatar-3.png' },
      ],
      unreadCount: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Add chats to the list
    this.chats = [generalChat, supportChat];

    // Generate mock messages for general chat
    const generalMessages: Message[] = [
      {
        id: uuidv4(),
        chatId: generalChat.id,
        text: 'Welcome to the General chat!',
        sender: { id: 'system', name: 'System' },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'system',
        isRead: true,
      },
      {
        id: uuidv4(),
        chatId: generalChat.id,
        text: 'Hi everyone, how are you doing today?',
        sender: { id: 'user-1', name: 'John Smith', avatar: '/assets/avatar-1.png' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: true,
      },
      {
        id: uuidv4(),
        chatId: generalChat.id,
        text: 'I\'m doing great! Just finished working on a new feature.',
        sender: { id: 'user-2', name: 'Jane Doe', avatar: '/assets/avatar-2.png' },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: false,
      },
    ];

    // Generate mock messages for support chat
    const supportMessages: Message[] = [
      {
        id: uuidv4(),
        chatId: supportChat.id,
        text: 'Welcome to the Support chat!',
        sender: { id: 'system', name: 'System' },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'system',
        isRead: true,
      },
      {
        id: uuidv4(),
        chatId: supportChat.id,
        text: 'How can we help you today?',
        sender: { id: 'support-1', name: 'Support Team', avatar: '/assets/avatar-3.png' },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'text',
        isRead: true,
      },
    ];

    // Add messages to the store
    this.messages[generalChat.id] = generalMessages;
    this.messages[supportChat.id] = supportMessages;

    // Set last messages for chats
    generalChat.lastMessage = generalMessages[generalMessages.length - 1];
    supportChat.lastMessage = supportMessages[supportMessages.length - 1];
  }
}

// Initialize and register with service registry
const chatService = ChatService.getInstance();
ServiceRegistry.getInstance().register('chat', chatService);

export default chatService;
