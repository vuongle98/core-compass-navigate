
export interface Service {
  id: number | string;
  name: string;
  description: string;
  type: string;
  status: 'running' | 'stopped' | 'error' | 'pending';
  createdAt: string;
  updatedAt: string;
  version: string;
  owner?: string;
  endpoint?: string;
  lastStatusChange?: string;
  resourceUsage?: {
    cpu: number;
    memory: number;
    disk: number;
  };
  config?: Record<string, any>;
  tags?: string[];
}

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'pending';

export interface ServiceListRequest {
  page: number;
  size: number;
  sort?: string;
  status?: ServiceStatus;
  type?: string;
  search?: string;
}

export interface ServiceCreateRequest {
  name: string;
  description: string;
  type: string;
  config?: Record<string, any>;
  tags?: string[];
}
