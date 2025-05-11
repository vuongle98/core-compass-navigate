import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart,
  Users,
  Shield,
  Key,
  FileText,
  Bell,
  Blocks,
  Flag,
  ScrollText,
  ClipboardList,
  Wrench,
  Bot,
  FileBox,
  BookOpen,
  Cog,
  ChevronDown,
  ChevronRight,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useLocation } from "react-router-dom";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  badge?: string;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItem = ({
  href,
  icon: Icon,
  title,
  badge,
  collapsed,
  onClick,
}: NavItemProps) => {
  const location = useLocation();
  const isActive =
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <NavLink
      to={href}
      className={({ isActive: routeActive }) =>
        cn(
          "flex items-center py-2 px-3 my-1 rounded-md transition-colors",
          "hover:bg-sidebar-hover",
          routeActive
            ? "bg-sidebar-active text-sidebar-active-foreground"
            : "text-sidebar-foreground"
        )
      }
      onClick={onClick}
    >
      <Icon className="h-4 w-4 min-w-4" />
      {!collapsed && (
        <span className="ml-3 flex-1 text-sm truncate">{title}</span>
      )}
      {!collapsed && badge && (
        <Badge variant="outline" className="ml-auto py-1 px-1.5 text-xs">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

interface NestedNavItemProps {
  icon: React.ElementType;
  title: string;
  collapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const NestedNavItem = ({
  icon: Icon,
  title,
  collapsed,
  children,
  defaultOpen = false,
}: NestedNavItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();

  // Check if any child route is active
  const childPaths = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child: React.ReactElement) => child.props.href);

  const isActive = childPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // Toggle submenu
  const toggleOpen = () => {
    if (!collapsed) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="my-1">
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
          "hover:bg-sidebar-hover",
          isActive
            ? "bg-sidebar-active text-sidebar-active-foreground"
            : "text-sidebar-foreground"
        )}
        onClick={toggleOpen}
      >
        <Icon className="h-4 w-4 min-w-4" />
        {!collapsed && (
          <>
            <span className="ml-3 flex-1 text-sm truncate">{title}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </>
        )}
      </div>

      {!collapsed && isOpen && (
        <div className="ml-7 pl-3 border-l border-sidebar-border">
          {children}
        </div>
      )}

      {/* When sidebar is collapsed, show submenu on hover */}
      {collapsed && (
        <div className="group relative">
          <div className="absolute left-full top-0 ml-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="mt-0 py-2 bg-sidebar rounded-md shadow-lg border border-sidebar-border overflow-hidden">
              <div className="px-3 py-2 font-medium text-sm border-b border-sidebar-border">
                {title}
              </div>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const chatSystemEnabled = useFeatureFlag("chat_system");

  return (
    <div className="flex flex-col flex-1 py-2 px-3 overflow-y-auto overflow-x-hidden">
      <NavItem
        href="/"
        icon={BarChart}
        title="Dashboard"
        collapsed={collapsed}
      />

      <NestedNavItem icon={Users} title="User Management" collapsed={collapsed}>
        <NavItem href="/users" icon={Users} title="Users" collapsed={false} />
        <NavItem href="/roles" icon={Shield} title="Roles" collapsed={false} />
        <NavItem
          href="/permissions"
          icon={Key}
          title="Permissions"
          collapsed={false}
        />
      </NestedNavItem>

      <NavItem
        href="/tokens"
        icon={Key}
        title="API Tokens"
        collapsed={collapsed}
      />

      <NavItem
        href="/files"
        icon={FileBox}
        title="Files"
        badge="New"
        collapsed={collapsed}
      />

      <NavItem
        href="/notifications"
        icon={Bell}
        title="Notifications"
        badge="5"
        collapsed={collapsed}
      />

      <NavItem
        href="/blogs"
        icon={BookOpen}
        title="Blogs"
        collapsed={collapsed}
      />

      <NavItem
        href="/bots"
        icon={Bot}
        title="Bot Management"
        collapsed={collapsed}
      />

      <NavItem
        href="/services"
        icon={Server}
        title="Service Management"
        badge="New"
        collapsed={collapsed}
      />

      {!collapsed && (
        <div className="mt-4">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            System
          </h3>
        </div>
      )}

      <NestedNavItem icon={Cog} title="System Settings" collapsed={collapsed}>
        <NavItem
          href="/configuration"
          icon={Wrench}
          title="Configuration"
          collapsed={false}
        />
        <NavItem
          href="/endpoint-secure"
          icon={Blocks}
          title="Endpoint Secure"
          collapsed={false}
        />
        <NavItem
          href="/feature-flags"
          icon={Flag}
          title="Feature Flags"
          collapsed={false}
        />
      </NestedNavItem>

      {!collapsed && (
        <div className="mt-4">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            Logs
          </h3>
        </div>
      )}

      <NavItem
        href="/audit-log"
        icon={ScrollText}
        title="Audit Log"
        collapsed={collapsed}
      />
      <NavItem
        href="/user-request-log"
        icon={ClipboardList}
        title="User Request Log"
        collapsed={collapsed}
      />
      <NavItem
        href="/event-log"
        icon={FileText}
        title="Event Log"
        collapsed={collapsed}
      />
    </div>
  );
}
