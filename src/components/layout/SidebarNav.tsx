
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
  LayoutDashboard
} from 'lucide-react';

interface SidebarNavProps {
  collapsed: boolean;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Roles',
      href: '/roles',
      icon: Shield,
    },
    {
      name: 'Permissions',
      href: '/permissions',
      icon: Key,
    },
    {
      name: 'Tokens',
      href: '/tokens',
      icon: Key,
    },
    {
      name: 'Files',
      href: '/files',
      icon: FileText,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'Configuration',
      href: '/configuration',
      icon: Settings,
    },
    {
      name: 'Feature Flags',
      href: '/feature-flags',
      icon: Flag,
    },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-2">
        {navItems.map((item) => (
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
    </nav>
  );
}
