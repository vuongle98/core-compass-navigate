
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
  roles: Role[] | string[];
  permissions?: Permission[];
  avatar?: string;
  status?: UserStatus;
  lastLogin?: string;
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
