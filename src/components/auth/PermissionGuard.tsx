import { ReactNode } from "react";
import { Permission } from "@/types/Auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission | Permission[];
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  fallback,
}: PermissionGuardProps) {
  const permissions = usePermissions();

  // Check if user has any of the required permissions
  const hasRequiredPermission = Array.isArray(permission)
    ? permission.some((p) => permissions.hasPermission(p))
    : permissions.hasPermission(permission);

  if (hasRequiredPermission) {
    return <>{children}</>;
  }

  // Return fallback or default "No Access" message
  return (
    fallback || (
      <Alert variant="destructive" className="max-w-md mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access this feature. Please contact an
          administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    )
  );
}
