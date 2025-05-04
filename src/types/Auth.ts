
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  userCount?: number;
  permissions?: Permission[];
  permissionIds?: (string | number)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string | number;
  name: string;
  code: string;
  description?: string;
  group?: string;
  module?: string;
  isActive?: boolean;
  roleIds?: (string | number)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // Adding name property as required
  roles: Role[] | string[];
  role?: string; // For backwards compatibility
  permissions?: Permission[];
  avatar?: string;
  status?: UserStatus;
  lastLogin?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetSubmit {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// UserPermissions interface for permissions hook
export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string | Permission) => boolean;
  hasRole: (roleCode: string) => boolean;
}

// Adding DEFAULT_ROLES
export const DEFAULT_ROLES = {
  ADMIN: {
    id: 1,
    name: 'Administrator',
    code: 'ADMIN',
    permissions: ['feature:flags', 'user:admin', 'system:admin']
  },
  USER: {
    id: 2,
    name: 'User',
    code: 'USER',
    permissions: ['user:read']
  },
  GUEST: {
    id: 3,
    name: 'Guest',
    code: 'GUEST',
    permissions: []
  },
  EDITOR: {
    id: 4,
    name: 'Editor',
    code: 'EDITOR',
    permissions: ['content:edit', 'content:publish']
  },
  MODERATOR: {
    id: 5,
    name: 'Moderator',
    code: 'MODERATOR',
    permissions: ['content:moderate', 'comment:moderate']
  }
};

// Add PermissionData interface for Permissions.tsx
export interface PermissionData extends Permission {
  module: string;
  isActive: boolean;
  code: string; // Required from Permission
}
