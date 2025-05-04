
export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  roles?: string[] | Role[];
  permissions?: string[] | Permission[];
  joinDate?: string;
  lastLogin?: string;
}

export interface Role {
  id: number | string;
  name: string;
  code: string;
  description?: string;
  permissions?: Permission[] | string[];
  permissionIds?: number[];
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
}

export interface Permission {
  id: number | string;
  name: string;
  code?: string;
  description?: string;
  module?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string | Permission) => boolean;
  hasRole: (roleCode: string) => boolean;
}

// Default roles for the application
export const DEFAULT_ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Full system access',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'permission:manage', 'feature:flags']
  },
  MANAGER: {
    id: 'manager',
    name: 'Manager',
    code: 'MANAGE',
    description: 'Department management',
    permissions: ['user:read', 'blog:read', 'blog:write']
  },
  USER: {
    id: 'user',
    name: 'User',
    code: 'USER',
    description: 'Regular user access',
    permissions: ['user:read']
  },
  GUEST: {
    id: 'guest',
    name: 'Guest',
    code: 'GUEST',
    description: 'Limited access',
    permissions: []
  }
};
