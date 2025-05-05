import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  status: "online" | "idle" | "offline";
  lastActive?: string;
}

interface ActiveUsersProps {
  users: User[];
  className?: string;
}

export function ActiveUsers({ users, className }: ActiveUsersProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full mr-2",
                    user.status === "online"
                      ? "bg-green-500"
                      : user.status === "idle"
                      ? "bg-yellow-500"
                      : "bg-gray-300"
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {user.status === "online"
                    ? "Online"
                    : user.status === "idle"
                    ? "Idle"
                    : user.lastActive
                    ? `Last seen ${user.lastActive}`
                    : "Offline"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
