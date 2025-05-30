import { LogOut, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import { useState } from "react";
import { GlobalSearch } from "./GlobalSearch";
import { cn } from "@/lib/utils";

export interface UserMenuProps {
  className?: string;
  collapsed?: boolean;
}
export function UserMenu({ collapsed }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Then perform client-side logout
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, still perform client-side logout
      logout();
      navigate("/login");
    }
  };

  // Get user initials from username
  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div
      className={cn(
        !collapsed
          ? "flex items-center gap-2"
          : "flex-col items-center justify-end gap-2"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSearchOpen(true)}
        className="relative h-8 w-8 rounded-full"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.username || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
