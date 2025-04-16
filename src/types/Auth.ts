export type Permission = 
  // Blog permissions
  | 'blog:create'
  | 'blog:read'
  | 'blog:update'
  | 'blog:delete'
  // User permissions
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:reset-password'
  // Role permissions
  | 'role:create'
  | 'role:read'
  | 'role:update'
  | 'role:delete'
  | 'role:assign'
  // Permission management
  | 'permission:manage'
  // System settings
  | 'settings:read'
  | 'settings:update'
  // Reporting
  | 'reports:view'
  | 'reports:export'
  // Other features
  | 'feature:flags'
  | 'files:manage'
  | 'notification:manage'
  | 'audit:view'
  | 'api:access';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roleCode: string) => boolean;
}

export const DEFAULT_ROLES: Record<string, Role> = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Full system access',
    permissions: [
      'blog:create', 'blog:read', 'blog:update', 'blog:delete',
      'user:create', 'user:read', 'user:update', 'user:delete', 'user:reset-password',
      'role:create', 'role:read', 'role:update', 'role:delete', 'role:assign',
      'permission:manage',
      'settings:read', 'settings:update',
      'reports:view', 'reports:export',
      'feature:flags', 'files:manage', 'notification:manage', 'audit:view', 'api:access'
    ]
  },
  EDITOR: {
    id: 'editor',
    name: 'Editor',
    code: 'EDITOR',
    description: 'Content management',
    permissions: [
      'blog:create', 'blog:read', 'blog:update', 'blog:delete',
      'user:read',
      'reports:view'
    ]
  },
  USER: {
    id: 'user',
    name: 'User',
    code: 'USER',
    description: 'Standard user access',
    permissions: [
      'blog:read',
      'user:read'
    ]
  },
  GUEST: {
    id: 'guest',
    name: 'Guest',
    code: 'GUEST',
    description: 'Limited access',
    permissions: [
      'blog:read'
    ]
  }
};
