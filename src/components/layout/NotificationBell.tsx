
import { useState, useEffect } from "react";
import { Bell, Check, MailOpen, Trash, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  sender?: string;
  senderAvatar?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: "System Update",
        content: "The system will be updated tonight at 2 AM. Please save your work.",
        time: "5 minutes ago",
        read: false,
        type: "info",
        sender: "System",
        senderAvatar: "/placeholder.svg"
      },
      {
        id: 2,
        title: "New Message",
        content: "You have received a new message from Admin",
        time: "1 hour ago",
        read: false,
        type: "info",
        sender: "Admin",
        senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
      },
      {
        id: 3,
        title: "Task Completed",
        content: "Your scheduled task has been completed successfully",
        time: "3 hours ago",
        read: true,
        type: "success",
        sender: "TaskManager",
        senderAvatar: "/placeholder.svg"
      },
      {
        id: 4,
        title: "Warning",
        content: "Your account storage is almost full (85%)",
        time: "Yesterday",
        read: true,
        type: "warning",
        sender: "Storage",
        senderAvatar: "/placeholder.svg"
      },
      {
        id: 5,
        title: "Error Detected",
        content: "There was an error processing your last request",
        time: "2 days ago",
        read: true,
        type: "error",
        sender: "ErrorHandler",
        senderAvatar: "/placeholder.svg"
      }
    ];

    setNotifications(mockNotifications);
    
    // Calculate unread count
    const unread = mockNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Recalculate unread count
    const updatedUnreadCount = notifications.filter(notification => 
      !notification.read && notification.id !== id
    ).length;
    setUnreadCount(updatedUnreadCount);
    
    toast.success("Notification marked as read", {
      description: "This notification has been marked as read",
      duration: 2000
    });
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success("All notifications cleared");
    setOpen(false);
  };

  const getNotificationTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "success":
        return "bg-green-100 text-green-800 border-green-300";
      case "error":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2" />;
      case "success":
        return <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />;
      case "error":
        return <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2" />;
      default:
        return <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2" />;
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Notifications</h4>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost" 
                  size="sm"
                  className="h-8 text-xs"
                  onClick={clearAllNotifications}
                >
                  <Trash className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Read progress</span>
                <span>{Math.round((1 - unreadCount / notifications.length) * 100)}%</span>
              </div>
              <Progress 
                value={Math.round((1 - unreadCount / notifications.length) * 100)}
                className="h-1"
              />
            </div>
          )}
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 py-2 border-b">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[350px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={notification.senderAvatar} 
                            alt={notification.sender || ''} 
                          />
                          <AvatarFallback>
                            {notification.sender?.slice(0, 2).toUpperCase() || 'SY'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"/>
                              )}
                              <h5 className="text-sm font-medium">{notification.title}</h5>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{notification.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className={`text-xs px-2 py-0.5 rounded inline-flex items-center border ${getNotificationTypeStyles(notification.type)}`}>
                              {getNotificationTypeIcon(notification.type)}
                              {notification.type}
                            </div>
                            {!notification.read && (
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}>
                                <MailOpen className="mr-1 h-3 w-3" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-6">
                  <div>
                    <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground">You're all caught up!</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[350px]">
              {notifications.filter(n => !n.read).length > 0 ? (
                <div className="divide-y">
                  {notifications
                    .filter(notification => !notification.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer bg-blue-50 dark:bg-blue-950/20"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={notification.senderAvatar} 
                              alt={notification.sender || ''} 
                            />
                            <AvatarFallback>
                              {notification.sender?.slice(0, 2).toUpperCase() || 'SY'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"/>
                                <h5 className="text-sm font-medium">{notification.title}</h5>
                              </div>
                              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{notification.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className={`text-xs px-2 py-0.5 rounded inline-flex items-center border ${getNotificationTypeStyles(notification.type)}`}>
                                {getNotificationTypeIcon(notification.type)}
                                {notification.type}
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}>
                                <MailOpen className="mr-1 h-3 w-3" />
                                Mark read
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-6">
                  <div>
                    <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No unread notifications</h3>
                    <p className="text-sm text-muted-foreground">You've read all your notifications</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            className="w-full text-center"
            onClick={handleViewAllNotifications}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
