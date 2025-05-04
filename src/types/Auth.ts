
export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  joinDate?: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}
