
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
  
  // Use localStorage to persist sidebar state between page loads
  useEffect(() => {
    const storedState = localStorage.getItem('sidebar-collapsed');
    if (storedState !== null) {
      setCollapsed(JSON.parse(storedState));
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Toggle sidebar function - no more hover effects
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
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
            onClick={toggleSidebar}
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
