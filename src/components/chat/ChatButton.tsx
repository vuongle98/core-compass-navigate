
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ChatPanel from './ChatPanel';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { getAnimationClass } from '@/lib/animation';

interface ChatButtonProps {
  className?: string;
}

const ChatButton = ({ className }: ChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isChatEnabled = useFeatureFlag('chat_system');
  const [unreadCount, setUnreadCount] = useState(3);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // Simulate receiving new messages with a ping pong effect
  useEffect(() => {
    if (!isOpen && unreadCount > 0) {
      const interval = setInterval(() => {
        setHasNewMessage(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setHasNewMessage(false);
    }
  }, [isOpen, unreadCount]);
  
  if (!isChatEnabled) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const buttonAnimation = hasNewMessage 
    ? getAnimationClass({
        type: 'bounce',
        duration: 500,
        delay: 0
      })
    : '';

  const panelAnimation = isOpen 
    ? getAnimationClass({ type: 'slide-in-right', duration: 300 })
    : getAnimationClass({ type: 'slide-out-right', duration: 300 });

  return (
    <>
      <Button
        onClick={toggleChat}
        className={`${buttonAnimation} fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 ${className}`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive"
                aria-label={`${unreadCount} unread messages`}
              >
                {unreadCount}
              </Badge>
            )}
          </>
        )}
      </Button>

      {isOpen && (
        <div className={`${panelAnimation} fixed bottom-20 right-6 w-96 sm:w-[450px] h-[550px] z-50`}>
          <ChatPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default ChatButton;
