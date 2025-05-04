
import { useAuth } from "@/contexts/AuthContext";
import { Permission, Role, DEFAULT_ROLES, UserPermissions } from "@/types/Auth";
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
      if (typeof role === 'object' && role !== null && 'permissions' in role) {
        return role as Role;
      }
      
      // If it's a role code string, map to default role
      const roleCode = typeof role === 'string' ? role : (role as Role).code;
      return { 
        id: roleCode || DEFAULT_ROLES.GUEST,
        code: roleCode || DEFAULT_ROLES.GUEST,
        name: roleCode || DEFAULT_ROLES.GUEST
      } as Role;
    });
    
    // Extract all permissions from all roles
    const allPermissions = roles.reduce<Permission[]>((acc, role) => {
      // Get permissions from the role
      const rolePermissions: Permission[] = [];
      
      if (role.permissions) {
        (role.permissions as (string | Permission)[]).forEach(perm => {
          if (typeof perm === 'string') {
            rolePermissions.push({ 
              id: perm, 
              name: perm, 
              code: perm
            });
          } else {
            rolePermissions.push(perm);
          }
        });
      }
      
      return [...acc, ...rolePermissions];
    }, [] as Permission[]);
    
    // Remove duplicates by ID
    const uniquePermissions = Array.from(
      new Map(allPermissions.map(item => [item.id, item])).values()
    );
    
    // For development: Add all permissions if user is admin
    const isAdmin = roles.some(role => role.code === 'ADMIN');
    if (isAdmin) {
      // Make sure admin has feature flags permission
      const hasFeatureFlags = uniquePermissions.some(p => 
        (typeof p === 'string' && p === 'feature:flags') || 
        (typeof p === 'object' && p.name === 'feature:flags')
      );
      
      if (!hasFeatureFlags) {
        uniquePermissions.push({ 
          id: 'feature:flags', 
          name: 'feature:flags', 
          code: 'feature:flags'
        });
      }
    }

    const result: UserPermissions = {
      roles,
      permissions: uniquePermissions,
      hasPermission: (permission: string | Permission) => {
        const permName = typeof permission === 'string' ? permission : permission.name;
        return uniquePermissions.some(p => 
          (typeof p === 'string' && p === permName) || 
          (typeof p === 'object' && p.name === permName)
        );
      },
      hasRole: (roleCode: string) => roles.some(role => 
        role.code?.toUpperCase() === roleCode.toUpperCase()
      )
    };
    
    return result;
  }, [user]);
}

// Permission guard hook for protected components
export function useGuard(requiredPermission: string | Permission): { allowed: boolean } {
  const permissions = usePermissions();
  const allowed = permissions.hasPermission(requiredPermission);
  
  return { allowed };
}
