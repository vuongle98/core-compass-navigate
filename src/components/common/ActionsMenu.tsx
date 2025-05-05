import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export type ActionType =
  | "view"
  | "edit"
  | "delete"
  | "download"
  | "copy"
  | "play"
  | "square"
  | "calendar-clock"
  | "x"
  | "trash";

export interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  type?: ActionType;
}

interface ActionsMenuProps {
  actions: Action[];
  size?: "sm" | "default" | "lg" | "icon";
}

export const ActionsMenu = ({ actions, size = "sm" }: ActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              className={
                action.destructive
                  ? "text-destructive focus:text-destructive"
                  : ""
              }
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
