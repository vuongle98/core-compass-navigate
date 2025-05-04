import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import ServiceRegistry from './ServiceRegistry';

interface Chat {
  id: string;
  name?: string;
  type: 'private' | 'group' | 'public';
  participants: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  latestMessage?: Message;
  userAvatar?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

class ChatService extends EventEmitter {
  private static instance: ChatService;
  private chats: Chat[] = [];
  private messages: Record<string, Message[]> = {};
  private connected = false;
  private userId: string | null = null;
  private userName: string | null = null;
  
  private constructor() {
    super();
    this.chats = this.getInitialChats();
  }
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Initialize the chat service (connect to WebSocket, etc.)
   */
  public connect(user: { id: string; name: string }): void {
    this.userId = user.id;
    this.userName = user.name;
    this.connected = true;
    this.emit('connected');
  }

  /**
   * Disconnect from the chat service
   */
  public disconnect(): void {
    this.connected = false;
    this.emit('disconnected');
  }

  /**
   * Get all chats for the current user
   */
  public getChats(): Chat[] {
    return this.chats.filter(chat => chat.participants.includes(this.userId || ''));
  }

  /**
   * Get a chat by ID
   */
  public getChat(chatId: string): Chat | undefined {
    return this.chats.find(chat => chat.id === chatId);
  }

  /**
   * Create a new private chat
   */
  public createPrivateChat(userId: string, userName: string, userAvatar?: string): Chat {
    const chatId = `private_${this.generateId()}`;
    const chat: Chat = {
      id: chatId,
      type: 'private',
      participants: [this.userId || '', userId],
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: userName,
      userAvatar: userAvatar
    };
    
    this.chats.push(chat);
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.getChats());
    
    return chat;
  }

  /**
   * Create a new group chat
   */
  public createGroupChat(name: string, participantIds: string[]): Chat {
    const chatId = `group_${this.generateId()}`;
    const chat: Chat = {
      id: chatId,
      name,
      type: 'group',
      participants: [this.userId || '', ...participantIds],
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.chats.push(chat);
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.getChats());
    
    return chat;
  }
  
  /**
   * Create a new public chat
   */
  public createPublicChat(name: string): Chat {
    const chatId = `public_${this.generateId()}`;
    const chat: Chat = {
      id: chatId,
      name,
      type: 'public',
      participants: [this.userId || ''],
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.chats.push(chat);
    this.emit('chat-created', chat);
    this.emit('chats-updated', this.getChats());
    
    return chat;
  }

  /**
   * Send a message to a chat
   */
  public sendMessage(chatId: string, text: string, type: 'text' | 'image' | 'file' = 'text'): void {
    const message: Message = {
      id: `msg_${this.generateId()}`,
      chatId,
      senderId: this.userId || '',
      senderName: this.userName || 'Unknown User',
      text,
      timestamp: new Date(),
      read: false,
      type,
    };
    
    // Add to messages
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    
    this.messages[chatId].push(message);
    
    // Emit message event
    this.emit('message', message);
    
    // Update chat object with latest message
    this.updateChatWithLatestMessage(chatId, message);
    
    // Generate random response for demo
    this.generateRandomResponse(chatId);
  }

  /**
   * Get all messages for a chat
   */
  public getMessages(chatId: string): Message[] {
    return this.messages[chatId] || [];
  }

  /**
   * Mark all messages in a chat as read
   */
  public markAsRead(chatId: string): void {
    if (this.messages[chatId]) {
      this.messages[chatId].forEach(message => {
        message.read = true;
      });
    }
  }
  
  /**
   * Update chat object with latest message
   */
  private updateChatWithLatestMessage(chatId: string, message: Message): void {
    const chat = this.getChat(chatId);
    if (chat) {
      chat.latestMessage = message;
      chat.updatedAt = new Date();
      this.emit('chats-updated', this.getChats());
    }
  }

  /**
   * Helper method to generate a random response message for demo purposes
   */
  private generateRandomResponse(chatId: string): void {
    // Only respond in demo mode
    setTimeout(() => {
      const botResponses = [
        'I understand what you mean.',
        'That\'s interesting!',
        'Could you tell me more about that?',
        'Thanks for sharing that information.',
        'I\'m not sure I follow. Can you explain?',
        'That\'s a great point!',
      ];
      
      const randomIndex = Math.floor(Math.random() * botResponses.length);
      const responseText = botResponses[randomIndex];
      
      const botMessage: Message = {
        id: `msg_${this.generateId()}`,
        chatId,
        senderId: 'assistant',
        senderName: 'AI Assistant',
        text: responseText,
        timestamp: new Date(),
        read: false,
        type: 'text',
      };
      
      // Add to messages
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      
      this.messages[chatId].push(botMessage);
      
      // Emit message event
      this.emit('message', botMessage);
      
      // Update chat object with latest message
      this.updateChatWithLatestMessage(chatId, botMessage);
      
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }
  
  /**
   * Helper method to generate a unique ID
   */
  private generateId(): string {
    return uuidv4();
  }
  
  /**
   * Initial chat data (for demo purposes)
   */
  private getInitialChats(): Chat[] {
    return [
      {
        id: 'chat1',
        name: 'General',
        type: 'public',
        participants: ['user1', 'user2', 'user3'],
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'chat2',
        name: 'Support',
        type: 'public',
        participants: ['user1', 'user2'],
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'chat3',
        name: 'Random',
        type: 'public',
        participants: ['user3', 'user4'],
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}

// Create singleton instance
const chatService = new ChatService();

// Access through ServiceRegistry
ServiceRegistry.register('chat', chatService);

export default chatService;
export type { Chat, Message };
