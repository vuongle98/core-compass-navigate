
export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  isActive?: boolean;
  createdAt?: string;
  permissionIds?: number[];
}

export interface Permission {
  id: number;
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

export interface UserProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface User {
  id: number;
  email?: string;
  roles: Role[];
  joinDate?: string;
  lastLogin?: string;
  isActive?: boolean;
  avatar?: string;
  username?: string;
  profile?: UserProfile;
  locked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  name?: string; // Adding name property to User interface
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  hasPermission: (permission: string | Permission) => boolean;
  hasRole: (roleCode: string) => boolean;
}

export const DEFAULT_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
  GUEST: "guest",
};
