
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  Shield,
  Key,
  FileText,
  Bell,
  Settings,
  Flag,
  LayoutDashboard,
  ClipboardList,
  Activity,
  LogIn,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarNavProps {
  collapsed: boolean;
}

type NavGroup = {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
};

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    management: true,
    content: false,
    logging: false,
    system: false
  });

  // Auto-open group that contains the active route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find which group contains the current path and open it
    navGroups.forEach(group => {
      const groupContainsCurrentPath = group.items.some(item => item.href === currentPath);
      if (groupContainsCurrentPath) {
        setOpenGroups(prev => ({
          ...prev,
          [group.name.toLowerCase()]: true
        }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupName: string) => {
    if (collapsed) return;
    
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      name: "Overview",
      icon: Folder,
      items: [
        {
          name: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        }
      ]
    },
    {
      name: "Management",
      icon: Folder,
      items: [
        {
          name: "Users",
          href: "/users",
          icon: Users,
        },
        {
          name: "Roles",
          href: "/roles",
          icon: Shield,
        },
        {
          name: "Permissions",
          href: "/permissions",
          icon: Key,
        },
        {
          name: "Tokens",
          href: "/tokens",
          icon: Key,
        },
        {
          name: "Files",
          href: "/files",
          icon: FileText,
        }
      ]
    },
    {
      name: "Logging",
      icon: Folder,
      items: [
        {
          name: "Audit Log",
          href: "/audit-log",
          icon: ClipboardList,
        },
        {
          name: "User Request Log",
          href: "/user-request-log",
          icon: LogIn,
        },
        {
          name: "Event Log",
          href: "/event-log",
          icon: Activity,
        }
      ]
    },
    {
      name: "System",
      icon: Folder,
      items: [
        {
          name: "Notifications",
          href: "/notifications",
          icon: Bell,
        },
        {
          name: "Configuration",
          href: "/configuration",
          icon: Settings,
        },
        {
          name: "Feature Flags",
          href: "/feature-flags",
          icon: Flag,
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col flex-1">
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navGroups.map((group) => (
            <li key={group.name} className="mb-2">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.name.toLowerCase())}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent/30",
                  collapsed ? "justify-center" : ""
                )}
              >
                <group.icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{group.name}</span>
                    {openGroups[group.name.toLowerCase()] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </>
                )}
              </button>
              
              {/* Group items */}
              {(openGroups[group.name.toLowerCase()] || collapsed) && (
                <ul className={cn(
                  "mt-1 space-y-1",
                  collapsed ? "px-0" : "pl-7 pr-2"
                )}>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          location.pathname === item.href
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                          collapsed ? 'justify-center' : ''
                        )}
                      >
                        <item.icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
