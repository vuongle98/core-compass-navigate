
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  mobileBreakpoint?: number; // Custom breakpoint for mobile view
  className?: string;
}

export const ActionButtons = ({ 
  actions, 
  mobileBreakpoint = 768,
  className = ''
}: ActionButtonsProps) => {
  const isMobile = useIsMobile();

  // If on mobile, show as dropdown menu
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            Actions <MoreVertical className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <DropdownMenuItem 
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center gap-2"
            >
              {action.icon && <span className="h-4 w-4">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // On desktop, show all buttons
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant={action.variant || 'outline'}
          size="sm"
          disabled={action.disabled}
          className="flex items-center gap-2"
        >
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
};
