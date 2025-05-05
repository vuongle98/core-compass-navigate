import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Laptop, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginActivity {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  device: "mobile" | "desktop" | "tablet" | "unknown";
  browser: string;
  ip?: string;
  location?: string;
}

interface RecentLoginsWidgetProps {
  className?: string;
}

export function RecentLoginsWidget({ className }: RecentLoginsWidgetProps) {
  // In a real app, this would come from an API
  const [logins, setLogins] = useState<LoginActivity[]>([
    {
      id: 1,
      userId: "user-1",
      userName: "John Smith",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      device: "desktop",
      browser: "Chrome",
      ip: "192.168.1.1",
      location: "New York, USA",
    },
    {
      id: 2,
      userId: "user-2",
      userName: "Jane Cooper",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      device: "mobile",
      browser: "Safari",
      ip: "192.168.1.2",
      location: "Los Angeles, USA",
    },
    {
      id: 3,
      userId: "user-3",
      userName: "Alex Johnson",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      device: "tablet",
      browser: "Firefox",
      ip: "192.168.1.3",
      location: "Chicago, USA",
    },
    {
      id: 4,
      userId: "user-4",
      userName: "Sarah Miller",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      device: "desktop",
      browser: "Edge",
      ip: "192.168.1.4",
      location: "Boston, USA",
    },
  ]);

  function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const loginTime = new Date(timestamp);
    const diffMs = now.getTime() - loginTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  function getDeviceIcon(device: string) {
    switch (device) {
      case "mobile":
      case "tablet":
        return <Smartphone className="h-4 w-4 text-muted-foreground" />;
      case "desktop":
      default:
        return <Laptop className="h-4 w-4 text-muted-foreground" />;
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Recent Logins</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {logins.map((login) => (
            <li key={login.id} className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarImage src={login.userAvatar} />
                <AvatarFallback>
                  {login.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{login.userName}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(login.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getDeviceIcon(login.device)}
                  <span className="text-xs text-muted-foreground">
                    {login.browser} • {login.location}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
