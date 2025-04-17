
import { Message } from '@/services/ChatService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

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
    <div className={cn(
      "flex gap-2",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {sender.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[85%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground ml-1 mb-1">{sender.name}</span>
        )}
        
        <div 
          className={cn(
            "px-3 py-2 rounded-2xl max-w-full break-words",
            isCurrentUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-muted rounded-tl-none",
            "shadow-sm"
          )}
        >
          {text}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 mx-1">
          {formatMessageTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
