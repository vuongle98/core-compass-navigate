
export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  isActive?: boolean;
  createdAt?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  module?: string;
}

export interface PermissionData extends Permission {
  description: string;
  isActive: boolean;
  module: string;
  createdAt: string;
  updatedAt: string;
  code: string; // Making this required to match Permission
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  role?: string;
  joinDate?: string;
  lastLogin?: string;
  isActive?: boolean;
  avatar?: string;
  username?: string; // Adding username property
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string | Permission) => boolean;
  hasRole: (roleCode: string) => boolean;
}

export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
  GUEST: 'guest'
};
