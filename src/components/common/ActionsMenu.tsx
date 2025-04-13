
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
}

interface ActionsMenuProps {
  actions: Action[];
}

export function ActionsMenu({ actions }: ActionsMenuProps) {
  // Map of action types to their respective icons
  const actionIcons: Record<ActionType, React.ReactNode> = {
    view: <Eye className="mr-2 h-4 w-4" />,
    edit: <Edit className="mr-2 h-4 w-4" />,
    delete: <Trash className="mr-2 h-4 w-4" />,
    download: <Download className="mr-2 h-4 w-4" />,
    copy: <Copy className="mr-2 h-4 w-4" />,
    approve: <CheckCircle className="mr-2 h-4 w-4" />,
    reject: <XCircle className="mr-2 h-4 w-4" />,
    share: <Share2 className="mr-2 h-4 w-4" />
  };

  // Group actions by category for better organization
  const viewActions = actions.filter(a => a.type === "view");
  const editActions = actions.filter(a => ["edit", "delete", "approve", "reject"].includes(a.type));
  const otherActions = actions.filter(a => ["download", "copy", "share"].includes(a.type));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
                {actionIcons[action.type]}
                {action.label}
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
                {actionIcons[action.type]}
                {action.label}
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
                {actionIcons[action.type]}
                {action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
