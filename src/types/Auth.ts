
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
}

export type UserPermissions = Record<string, boolean>;

export const DEFAULT_ROLES = ['user', 'admin', 'manager'];
