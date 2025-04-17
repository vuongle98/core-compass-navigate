
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from '../ThemeToggle';
import { UserMenu } from './UserMenu';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle mouse enter - expand after small delay
  const handleMouseEnter = () => {
    if (collapsed) {
      // Clear any existing timeout
      if (hoverTimeout) clearTimeout(hoverTimeout);
      
      // Set a small delay before expanding
      const timeout = setTimeout(() => {
        setCollapsed(false);
      }, 300);
      
      setHoverTimeout(timeout);
    }
  };

  // Handle mouse leave - collapse after delay
  const handleMouseLeave = () => {
    // Clear any existing timeout
    if (hoverTimeout) clearTimeout(hoverTimeout);
    
    // Set a delay before collapsing to prevent flicker
    const timeout = setTimeout(() => {
      setCollapsed(true);
    }, 500);
    
    setHoverTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <div
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">CoreApp</h2>
        )}
        <div className="flex items-center ml-auto">
          {!collapsed && <ThemeToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "mx-auto" : ""}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>
      <SidebarNav collapsed={collapsed} />
      <div className="mt-auto p-2 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <UserMenu />
            {collapsed ? null : <span className="text-sm text-muted-foreground">v1.0.0</span>}
          </div>
        ) : (
          <UserMenu />
        )}
      </div>
    </div>
  );
}
