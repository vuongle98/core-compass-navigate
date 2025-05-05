export interface UserRequest {
  id: number;
  endpoint: string;
  method: string;
  user: string;
  timestamp: string;
  status: number;
  duration: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
}

export interface Event {
  id: number;
  event: string;
  source: string;
  level: string;
  timestamp: string;
  message: string;
  user?: string;
  details?: string;
}