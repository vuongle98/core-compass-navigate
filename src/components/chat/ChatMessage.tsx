
import { Message } from '@/services/ChatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const { text, sender, timestamp, type } = message;
  
  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };
  
  // System messages
  if (type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
          {text}
        </span>
      </div>
    );
  }
  
  // Regular messages
  return (
    <div className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback>{sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground">{sender.name}</span>
        )}
        
        <div 
          className={`px-3 py-2 rounded-lg max-w-[200px] break-words ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}
        >
          {text}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1">
          {formatMessageTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
