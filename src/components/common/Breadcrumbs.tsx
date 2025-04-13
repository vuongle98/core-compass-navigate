
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Generate breadcrumbs based on current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) {
      return items;
    }

    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Always include home
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathParts.forEach((part) => {
      currentPath += `/${part}`;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      
      // Don't add path for the last item (current page)
      if (currentPath === location.pathname) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList className="mb-4">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.label + index}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  {index === 0 ? (
                    <Link to={item.path || '/'} className="flex items-center">
                      <Home className="h-3.5 w-3.5 mr-1" />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <Link to={item.path || '/'}>{item.label}</Link>
                  )}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
