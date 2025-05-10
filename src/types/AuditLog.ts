
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
