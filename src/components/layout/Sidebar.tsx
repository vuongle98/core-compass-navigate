
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from '../ThemeToggle';
import { UserMenu } from './UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const isMobile = useIsMobile();
  
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage, default to collapsed on mobile
    const storedState = localStorage.getItem('sidebar-collapsed');
    return storedState !== null ? JSON.parse(storedState) : isMobile;
  });
  
  const [hidden, setHidden] = useState(isMobile);
  
  // Update collapsed state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [isMobile]);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };
  
  const toggleVisibility = () => {
    setHidden(prev => !prev);
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
          'bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0 z-40',
          collapsed ? 'w-16' : 'w-64',
          hidden ? 'hidden' : 'flex',
          isMobile && !hidden ? 'fixed inset-y-0 left-0 h-full shadow-xl' : '',
          className
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-sidebar-foreground">CoreApp</h2>
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
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </Button>
            )}
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
