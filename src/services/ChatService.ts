import LoggingService from "./LoggingService";
import ServiceRegistry from "./ServiceRegistry";

export interface Chat {
  id: string;
  type: 'public' | 'private' | 'group';
  name?: string;
  participants: { id: string; name: string; avatar?: string }[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  sender: { id: string; name: string; avatar?: string };
  text: string;
  timestamp: Date;
}

/**
 * Chat Service for managing chat rooms and messages
 */
class ChatService {
  private static instance: ChatService;
  private chats: Map<string, Chat> = new Map();
  
  private constructor() {
    // Initialize with some mock data
    this.createPublicChat('General Chat');
    this.createPublicChat('Random Banter');
    this.createPrivateChat('user-1', 'John Doe');
    this.createGroupChat('Team Awesome', ['user-1', 'user-2']);
    
    LoggingService.info('chat', 'service_initialized', 'Chat service initialized');
  }
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  /**
   * Get all chats
   */
  public getChats(): Chat[] {
    return Array.from(this.chats.values());
  }
  
  /**
   * Get a chat by ID
   */
  public getChat(id: string): Chat | undefined {
    return this.chats.get(id);
  }
  
  /**
   * Create a new public chat
   */
  public createPublicChat(name: string): Chat {
    const chatId = `public-${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      type: 'public',
      name: name,
      participants: [],
      messages: [],
      unreadCount: 0,
    };
    this.chats.set(chatId, newChat);
    LoggingService.info('chat', 'chat_created', 'Public chat created', { chatId, name });
    return newChat;
  }
  
  /**
   * Create a new private chat
   */
  public createPrivateChat(userId: string, username: string): Chat {
    const chatId = `private-${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      type: 'private',
      participants: [{ id: userId, name: username }],
      messages: [],
      unreadCount: 0,
    };
    this.chats.set(chatId, newChat);
    LoggingService.info('chat', 'chat_created', 'Private chat created', { chatId, userId, username });
    return newChat;
  }
  
  /**
   * Create a new group chat
   */
  public createGroupChat(name: string, userIds: string[]): Chat {
    const chatId = `group-${Date.now()}`;
    // Mock fetching user details
    const participants = userIds.map(id => ({ id, name: `User ${id}` }));
    const newChat: Chat = {
      id: chatId,
      type: 'group',
      name: name,
      participants: participants,
      messages: [],
      unreadCount: 0,
    };
    this.chats.set(chatId, newChat);
    LoggingService.info('chat', 'chat_created', 'Group chat created', { chatId, name, userIds });
    return newChat;
  }
  
  /**
   * Send a message to a chat
   */
  public sendMessage(chatId: string, senderId: string, text: string): ChatMessage {
    const chat = this.chats.get(chatId);
    if (!chat) {
      LoggingService.error('chat', 'chat_not_found', 'Chat not found', { chatId });
      throw new Error(`Chat not found: ${chatId}`);
    }
    
    // Mock fetching sender details
    const sender = { id: senderId, name: `User ${senderId}` };
    const message: ChatMessage = {
      id: `message-${Date.now()}`,
      sender: sender,
      text: text,
      timestamp: new Date(),
    };
    
    chat.messages.push(message);
    chat.lastMessage = message;
    
    // Increment unread count for other participants
    this.chats.forEach((c, id) => {
      if (id !== chatId) {
        c.unreadCount++;
      }
    });
    
    LoggingService.info('chat', 'message_sent', 'Message sent to chat', { chatId, senderId, text });
    return message;
  }
  
  /**
   * Mark a chat as read
   */
  public markChatAsRead(chatId: string): void {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.unreadCount = 0;
      LoggingService.info('chat', 'chat_read', 'Chat marked as read', { chatId });
    }
  }
  
  /**
   * Add a participant to a group chat
   */
  public addParticipant(chatId: string, userId: string, username: string): void {
    const chat = this.chats.get(chatId);
    if (!chat || chat.type !== 'group') {
      LoggingService.error('chat', 'chat_invalid_operation', 'Cannot add participant to non-group chat', { chatId });
      throw new Error('Cannot add participant to non-group chat');
    }
    
    // Check if user already exists
    if (chat.participants.find(p => p.id === userId)) {
      LoggingService.warn('chat', 'chat_duplicate_participant', 'Participant already exists in chat', { chatId, userId });
      return;
    }
    
    chat.participants.push({ id: userId, name: username });
    LoggingService.info('chat', 'chat_participant_added', 'Participant added to chat', { chatId, userId, username });
  }
  
  /**
   * Remove a participant from a group chat
   */
  public removeParticipant(chatId: string, userId: string): void {
    const chat = this.chats.get(chatId);
    if (!chat || chat.type !== 'group') {
      LoggingService.error('chat', 'chat_invalid_operation', 'Cannot remove participant from non-group chat', { chatId });
      throw new Error('Cannot remove participant from non-group chat');
    }
    
    chat.participants = chat.participants.filter(p => p.id !== userId);
    LoggingService.info('chat', 'chat_participant_removed', 'Participant removed from chat', { chatId, userId });
  }
  
  /**
   * Update chat name (for public and group chats)
   */
  public updateChatName(chatId: string, name: string): void {
    const chat = this.chats.get(chatId);
    if (!chat || chat.type === 'private') {
      LoggingService.error('chat', 'chat_invalid_operation', 'Cannot update name for private chat', { chatId });
      throw new Error('Cannot update name for private chat');
    }
    
    chat.name = name;
    LoggingService.info('chat', 'chat_name_updated', 'Chat name updated', { chatId, name });
  }
  
  /**
   * Get messages for a chat
   */
  public getChatMessages(chatId: string): ChatMessage[] {
    const chat = this.chats.get(chatId);
    return chat ? chat.messages : [];
  }
  
  /**
   * Clear chat history
   */
  public clearChatHistory(chatId: string): void {
    const chat = this.chats.get(chatId);
    if (chat) {
      chat.messages = [];
      LoggingService.info('chat', 'chat_history_cleared', 'Chat history cleared', { chatId });
    }
  }
  
  /**
   * Delete a chat
   */
  public deleteChat(chatId: string): void {
    if (this.chats.has(chatId)) {
      this.chats.delete(chatId);
      LoggingService.info('chat', 'chat_deleted', 'Chat deleted', { chatId });
    } else {
      LoggingService.warn('chat', 'chat_delete_failed', 'Chat not found for deletion', { chatId });
    }
  }
  
  /**
   * Simulate typing indicator
   */
  public simulateTyping(chatId: string, userId: string): void {
    LoggingService.debug('chat', 'chat_typing', 'User is typing in chat', { chatId, userId });
    // In a real application, you would implement a more sophisticated typing indicator
  }
  
  /**
   * Get total number of unread messages across all chats
   */
  public getTotalUnreadMessages(): number {
    let total = 0;
    this.chats.forEach(chat => {
      total += chat.unreadCount;
    });
    return total;
  }
  
  /**
   * Reset unread messages count for all chats (e.g., on user logout)
   */
  public resetUnreadMessages(): void {
    this.chats.forEach(chat => {
      chat.unreadCount = 0;
    });
    LoggingService.info('chat', 'chat_unread_reset', 'Unread messages reset for all chats');
  }
  
  /**
   * Search for chats by name or participant name
   */
  public searchChats(query: string): Chat[] {
    const searchTerm = query.toLowerCase();
    const results: Chat[] = [];
    
    this.chats.forEach(chat => {
      if (chat.name?.toLowerCase().includes(searchTerm) ||
          chat.participants.some(p => p.name.toLowerCase().includes(searchTerm))) {
        results.push(chat);
      }
    });
    
    return results;
  }
  
  /**
   * Generate a unique chat ID
   */
  private generateChatId(type: 'public' | 'private' | 'group'): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Mock function to simulate fetching user details
   */
  private mockGetUserDetails(userId: string): { id: string; name: string; avatar?: string } {
    // Replace with actual user data retrieval logic
    return {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://i.pravatar.cc/150?u=${userId}`, // Generate a random avatar URL
    };
  }
  
  /**
   * Simulate receiving a new message (for testing purposes)
   */
  public receiveMessage(chatId: string, senderId: string, text: string): void {
    const chat = this.chats.get(chatId);
    if (!chat) {
      LoggingService.error('chat', 'chat_not_found', 'Chat not found', { chatId });
      return;
    }
    
    const sender = this.mockGetUserDetails(senderId);
    const message: ChatMessage = {
      id: `message-${Date.now()}`,
      sender: sender,
      text: text,
      timestamp: new Date(),
    };
    
    chat.messages.push(message);
    chat.lastMessage = message;
    chat.unreadCount++;
    
    LoggingService.info('chat', 'message_received', 'Simulated message received', { chatId, senderId, text });
  }
}

// Export singleton instance
const chatService = ChatService.getInstance();
ServiceRegistry.getInstance().register('chat', chatService);

export default chatService;
