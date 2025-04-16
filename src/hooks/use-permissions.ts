
import { useAuth } from "@/contexts/AuthContext";
import { Permission, DEFAULT_ROLES, UserPermissions } from "@/types/Auth";
import { useMemo } from "react";

export function usePermissions(): UserPermissions {
  const { user } = useAuth();
  
  return useMemo(() => {
    // Default to guest permissions if no user or role
    const userRoles = user?.roles || [DEFAULT_ROLES.GUEST];
    
    // If user has a single role string, convert to array
    const roleArray = Array.isArray(userRoles) 
      ? userRoles 
      : [userRoles];
    
    // Map role strings to actual role objects
    const roles = roleArray.map(role => {
      // If it's already a role object with permissions
      if (typeof role === 'object' && role.permissions) {
        return role;
      }
      
      // If it's a role code string, map to default role
      const roleCode = typeof role === 'string' ? role : role.code;
      return DEFAULT_ROLES[roleCode.toUpperCase()] || DEFAULT_ROLES.GUEST;
    });
    
    // Extract all permissions from all roles
    const allPermissions = roles.reduce<Permission[]>((acc, role) => {
      // Explicitly cast to Permission[] to avoid the unknown[] type error
      const rolePermissions = Array.isArray(role.permissions) 
        ? (role.permissions as Permission[])
        : [];
      
      return [...acc, ...rolePermissions];
    }, [] as Permission[]);
    
    // Remove duplicates - use type assertion to ensure TypeScript knows this is Permission[]
    const uniquePermissions = [...new Set(allPermissions)] as Permission[];
    
    return {
      roles,
      permissions: uniquePermissions,
      hasPermission: (permission: Permission) => uniquePermissions.includes(permission),
      hasRole: (roleCode: string) => roles.some(role => 
        role.code.toUpperCase() === roleCode.toUpperCase()
      )
    };
  }, [user]);
}

// Permission guard hook for protected components
export function useGuard(requiredPermission: Permission): { allowed: boolean } {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(requiredPermission);
  
  return { allowed };
}
