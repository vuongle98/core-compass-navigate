import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

type NavConfig = (NavItem | NavGroup)[];

const navigationConfig: NavConfig = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Bots",
    href: "/bots",
  },
  {
    title: "Services",
    href: "/services",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Storage",
    href: "/storage",
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        href: "/profile",
      },
      {
        title: "Account",
        href: "/account",
      },
    ],
  },
];

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(title)
        ? prevOpenItems.filter((item) => item !== title)
        : [...prevOpenItems, title]
    );
  };

  return (
    <div className="flex-1 py-4">
      <nav className="grid items-start gap-2">
        {navigationConfig.map((item, index) =>
          "items" in item ? (
            <Collapsible key={index} className="w-full">
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between py-2 px-4 w-full rounded-md hover:bg-secondary/50 data-[state=open]:bg-secondary/50",
                  openItems.includes(item.title) ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => toggleItem(item.title)}
                disabled={collapsed}
              >
                <span>{item.title}</span>
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {item.items.map((subItem) => (
                  <Link key={subItem.title} to={subItem.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start px-8",
                        location.pathname === subItem.href
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                        collapsed ? "hidden" : "block"
                      )}
                    >
                      {subItem.title}
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link key={item.title} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "justify-start",
                  location.pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                  collapsed ? "px-2.5" : "px-4"
                )}
              >
                {item.title}
              </Button>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
