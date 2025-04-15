
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
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

interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

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
      },
      {
        id: 2,
        title: "New Message",
        content: "You have received a new message from Admin",
        time: "1 hour ago",
        read: false,
        type: "info",
      },
      {
        id: 3,
        title: "Task Completed",
        content: "Your scheduled task has been completed successfully",
        time: "3 hours ago",
        read: true,
        type: "success",
      },
      {
        id: 4,
        title: "Warning",
        content: "Your account storage is almost full (85%)",
        time: "Yesterday",
        read: true,
        type: "warning",
      },
      {
        id: 5,
        title: "Error Detected",
        content: "There was an error processing your last request",
        time: "2 days ago",
        read: true,
        type: "error",
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
      <PopoverContent align="end" className="w-[350px] p-0">
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
                  Mark all as read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost" 
                  size="sm"
                  className="h-8 text-xs"
                  onClick={clearAllNotifications}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 py-2 border-b">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? "bg-blue-500" : "bg-gray-300"}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium">{notification.title}</h5>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.content}</p>
                          <div className={`mt-2 text-xs px-2 py-0.5 rounded inline-block border ${getNotificationTypeStyles(notification.type)}`}>
                            {notification.type}
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
            <ScrollArea className="h-[300px]">
              {notifications.filter(n => !n.read).length > 0 ? (
                <div className="divide-y">
                  {notifications
                    .filter(notification => !notification.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer bg-blue-50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-medium">{notification.title}</h5>
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{notification.content}</p>
                            <div className={`mt-2 text-xs px-2 py-0.5 rounded inline-block border ${getNotificationTypeStyles(notification.type)}`}>
                              {notification.type}
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
                    <h3 className="font-medium mb-1">No unread notifications</h3>
                    <p className="text-sm text-muted-foreground">You've read all your notifications</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
