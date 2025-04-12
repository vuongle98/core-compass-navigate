
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from '../ThemeToggle';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-sidebar-foreground">CoreApp</h2>
        )}
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="mx-auto"
          >
            <ChevronRight size={18} />
          </Button>
        ) : (
          <div className="flex items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft size={18} />
            </Button>
          </div>
        )}
      </div>
      <SidebarNav collapsed={collapsed} />
    </div>
  );
}
