
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Settings, 
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
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useLocation } from 'react-router-dom';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  badge?: string;
  collapsed: boolean;
}

const NavItem = ({ href, icon: Icon, title, badge, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  return (
    <NavLink
      to={href}
      className={({ isActive: routeActive }) => cn(
        'flex items-center py-2 px-3 my-1 rounded-md transition-colors',
        'hover:bg-sidebar-hover',
        routeActive ? 'bg-sidebar-active text-sidebar-active-foreground' : 'text-sidebar-foreground'
      )}
    >
      <Icon className="h-4 w-4 mr-3" />
      {!collapsed && (
        <span className="flex-1 text-sm">{title}</span>
      )}
      {!collapsed && badge && (
        <Badge variant="outline" className="ml-auto py-1 px-1.5 text-xs">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const chatSystemEnabled = useFeatureFlag('chat_system');
  
  return (
    <div className="flex flex-col flex-1 overflow-y-auto py-2 px-3">
      <NavItem
        href="/"
        icon={BarChart}
        title="Dashboard"
        collapsed={collapsed}
      />
      <NavItem
        href="/users"
        icon={Users}
        title="Users"
        collapsed={collapsed}
      />
      <NavItem
        href="/roles"
        icon={Shield}
        title="Roles"
        collapsed={collapsed}
      />
      <NavItem
        href="/permissions"
        icon={Key}
        title="Permissions"
        collapsed={collapsed}
      />
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
      
      {!collapsed && (
        <div className="mt-4">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            System
          </h3>
        </div>
      )}
      
      <NavItem
        href="/configuration"
        icon={Wrench}
        title="Configuration"
        collapsed={collapsed}
      />
      <NavItem
        href="/endpoint-secure"
        icon={Blocks}
        title="Endpoint Secure"
        collapsed={collapsed}
      />
      <NavItem
        href="/feature-flags"
        icon={Flag}
        title="Feature Flags"
        collapsed={collapsed}
      />
      
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
