
import { 
  MoreHorizontal, 
  Trash, 
  Edit, 
  Eye, 
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ActionType = 
  | "view" 
  | "edit" 
  | "delete" 
  | "download" 
  | "copy" 
  | "approve" 
  | "reject" 
  | "share";

interface Action {
  type: ActionType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  badge?: string;
}

interface ActionsMenuProps {
  actions: Action[];
  variant?: "dropdown" | "buttons";
  buttonVariant?: "ghost" | "outline";
}

export function ActionsMenu({ 
  actions,
  variant = "dropdown",
  buttonVariant = "ghost"
}: ActionsMenuProps) {
  // Map of action types to their respective icons
  const actionIcons: Record<ActionType, React.ReactNode> = {
    view: <Eye className="h-4 w-4" />,
    edit: <Edit className="h-4 w-4" />,
    delete: <Trash className="h-4 w-4" />,
    download: <Download className="h-4 w-4" />,
    copy: <Copy className="h-4 w-4" />,
    approve: <CheckCircle className="h-4 w-4" />,
    reject: <XCircle className="h-4 w-4" />,
    share: <Share2 className="h-4 w-4" />
  };

  // Group actions by category for better organization
  const viewActions = actions.filter(a => a.type === "view");
  const editActions = actions.filter(a => ["edit", "delete", "approve", "reject"].includes(a.type));
  const otherActions = actions.filter(a => ["download", "copy", "share"].includes(a.type));
  
  // If variant is buttons, render buttons instead of dropdown
  if (variant === "buttons") {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          {actions.map((action) => (
            <Tooltip key={action.type}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant={buttonVariant}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    className="relative"
                  >
                    {actionIcons[action.type]}
                    {action.badge && (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.tooltip || action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {viewActions.length > 0 && (
          <>
            {viewActions.map((action) => (
              <DropdownMenuItem
                key={action.type}
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick();
                }}
                disabled={action.disabled}
              >
                <div className="flex w-full items-center">
                  {actionIcons[action.type]}
                  <span className="ml-2">{action.label}</span>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {(editActions.length > 0 || otherActions.length > 0) && <DropdownMenuSeparator />}
          </>
        )}
        
        {editActions.length > 0 && (
          <>
            {editActions.map((action) => (
              <DropdownMenuItem
                key={action.type}
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick();
                }}
                disabled={action.disabled}
              >
                <div className="flex w-full items-center">
                  {actionIcons[action.type]}
                  <span className="ml-2">{action.label}</span>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {otherActions.length > 0 && <DropdownMenuSeparator />}
          </>
        )}
        
        {otherActions.length > 0 && (
          <>
            {otherActions.map((action) => (
              <DropdownMenuItem
                key={action.type}
                onClick={(e) => {
                  e.preventDefault();
                  action.onClick();
                }}
                disabled={action.disabled}
              >
                <div className="flex w-full items-center">
                  {actionIcons[action.type]}
                  <span className="ml-2">{action.label}</span>
                  {action.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {action.badge}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
