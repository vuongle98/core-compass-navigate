import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import useLocalStorage from "@/hooks/use-local-storage";
import { ThemeToggle } from "../../ThemeToggle";
import { SidebarNav } from "./SidebarNav";
import { UserMenu } from "../UserMenu";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const isMobile = useIsMobile();

  const [collapsed, setCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    isMobile
  );
  const [hidden, setHidden] = useState(isMobile);

  // Update collapsed state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [isMobile]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleVisibility = () => {
    setHidden(!hidden);
  };

  return (
    <>
      {/* Mobile menu button that appears when sidebar is hidden */}
      {hidden && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVisibility}
          className="fixed top-4 left-4 z-50"
          type="button"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </Button>
      )}

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col h-screen z-40",
          collapsed ? "w-16" : "w-64",
          hidden ? "hidden" : "flex",
          isMobile ? "fixed inset-y-0 left-0 shadow-xl" : "sticky top-0",
          className
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              CoreApp
            </h2>
          )}
          <div className="flex items-center ml-auto">
            {!collapsed && !isMobile && <ThemeToggle />}
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVisibility}
                className="ml-1"
                type="button"
              >
                <X size={18} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={collapsed ? "mx-auto" : ""}
                type="button"
              >
                {collapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </Button>
            )}
          </div>
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="mt-auto p-2 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <UserMenu />
              {!collapsed && (
                <span className="text-sm text-muted-foreground">v1.0.0</span>
              )}
            </div>
          ) : (
            <UserMenu />
          )}
        </div>

        {/* Backdrop overlay for mobile */}
        {isMobile && !hidden && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={toggleVisibility}
            aria-hidden="true"
          />
        )}
      </aside>
    </>
  );
}
