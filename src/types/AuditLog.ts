
import { User } from "./Auth";

export type AuditLog = {
  id: number;
  timestamp: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  success?: boolean;
};

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  success: boolean;
}

export interface AuditLogFilters {
  search?: string;
  user?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
}

export interface ActivityLog {
  id: number;
  userId: string;
  username: string;
  module: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  meta?: Record<string, any>;
}

export interface BatchLogEntry {
  module: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}
