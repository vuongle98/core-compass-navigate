
import { ApiResponse, PaginatedData } from '@/types/Common';
import { Service, ServiceStatus, ServiceCreateRequest } from '@/types/Service';

// Mock services data
const mockServices: Service[] = [
  {
    id: 1,
    name: 'Database Backup Service',
    description: 'Automated daily database backup service',
    type: 'backup',
    status: 'running',
    createdAt: '2023-04-15T08:00:00Z',
    updatedAt: '2023-04-15T08:00:00Z',
    version: '1.0.0',
    owner: 'system',
    endpoint: '/api/services/backup',
    lastStatusChange: '2023-04-15T08:00:00Z',
    resourceUsage: {
      cpu: 2.5,
      memory: 256,
      disk: 1024
    },
    tags: ['backup', 'database', 'automated']
  },
  {
    id: 2,
    name: 'Email Notification Service',
    description: 'Handles outgoing email notifications',
    type: 'notification',
    status: 'running',
    createdAt: '2023-04-10T10:30:00Z',
    updatedAt: '2023-04-14T16:45:00Z',
    version: '1.2.3',
    owner: 'admin',
    endpoint: '/api/services/email',
    lastStatusChange: '2023-04-14T16:45:00Z',
    resourceUsage: {
      cpu: 1.2,
      memory: 128,
      disk: 512
    },
    tags: ['email', 'notification']
  },
  {
    id: 3,
    name: 'Log Rotation Service',
    description: 'Rotates and archives system logs',
    type: 'maintenance',
    status: 'stopped',
    createdAt: '2023-03-20T15:25:00Z',
    updatedAt: '2023-04-12T09:10:00Z',
    version: '0.9.1',
    owner: 'system',
    lastStatusChange: '2023-04-12T09:10:00Z',
    resourceUsage: {
      cpu: 0.1,
      memory: 64,
      disk: 2048
    },
    tags: ['logs', 'maintenance', 'system']
  },
  {
    id: 4,
    name: 'Report Generation Service',
    description: 'Generates weekly performance reports',
    type: 'reporting',
    status: 'error',
    createdAt: '2023-04-01T12:00:00Z',
    updatedAt: '2023-04-14T23:15:00Z',
    version: '1.1.0',
    owner: 'reports',
    endpoint: '/api/services/reports',
    lastStatusChange: '2023-04-14T23:15:00Z',
    resourceUsage: {
      cpu: 3.8,
      memory: 512,
      disk: 1024
    },
    tags: ['reports', 'analytics']
  },
  {
    id: 5,
    name: 'Authentication Service',
    description: 'Handles user authentication and authorization',
    type: 'security',
    status: 'running',
    createdAt: '2023-02-10T08:30:00Z',
    updatedAt: '2023-04-13T16:20:00Z',
    version: '2.0.1',
    owner: 'security',
    endpoint: '/api/services/auth',
    lastStatusChange: '2023-04-13T16:20:00Z',
    resourceUsage: {
      cpu: 4.2,
      memory: 384,
      disk: 256
    },
    tags: ['auth', 'security', 'critical']
  }
];

class ServiceManagementService {
  // Get paginated list of services
  async getServices({
    page = 0,
    size = 10,
    sort,
    status,
    type,
    search
  }: {
    page?: number;
    size?: number;
    sort?: string;
    status?: ServiceStatus;
    type?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedData<Service>>> {
    try {
      // In a real app, this would be an API call
      // For now, we'll filter the mock data
      let filteredServices = [...mockServices];
      
      if (status) {
        filteredServices = filteredServices.filter(s => s.status === status);
      }
      
      if (type) {
        filteredServices = filteredServices.filter(s => s.type === type);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredServices = filteredServices.filter(s => 
          s.name.toLowerCase().includes(searchLower) || 
          s.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Sorting
      if (sort) {
        const [field, direction] = sort.split(',');
        filteredServices.sort((a, b) => {
          const aValue = a[field as keyof Service];
          const bValue = b[field as keyof Service];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          return 0;
        });
      }
      
      // Pagination
      const totalElements = filteredServices.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const content = filteredServices.slice(startIndex, startIndex + size);
      
      return {
        success: true,
        message: 'Services retrieved successfully',
        data: {
          content,
          totalElements,
          totalPages,
          number: page,
          size
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve services',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Get service by ID
  async getServiceById(id: number | string): Promise<ApiResponse<Service>> {
    try {
      // In a real app, this would be an API call
      const service = mockServices.find(s => s.id === id);
      
      if (!service) {
        return {
          success: false,
          message: 'Service not found',
          data: {} as Service,
          error: 'Service not found'
        };
      }
      
      return {
        success: true,
        message: 'Service retrieved successfully',
        data: service,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve service',
        data: {} as Service,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Create service
  async createService(serviceData: ServiceCreateRequest): Promise<ApiResponse<Service>> {
    try {
      // In a real app, this would be an API call
      const newService: Service = {
        ...serviceData,
        id: mockServices.length + 1,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      
      // In real app, this would be persisted to the backend
      mockServices.push(newService);
      
      return {
        success: true,
        message: 'Service created successfully',
        data: newService,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create service',
        data: {} as Service,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Update service status
  async updateServiceStatus(
    id: number | string, 
    status: ServiceStatus
  ): Promise<ApiResponse<Service>> {
    try {
      // In a real app, this would be an API call
      const serviceIndex = mockServices.findIndex(s => s.id === id);
      
      if (serviceIndex === -1) {
        return {
          success: false,
          message: 'Service not found',
          data: {} as Service,
          error: 'Service not found'
        };
      }
      
      mockServices[serviceIndex] = {
        ...mockServices[serviceIndex],
        status,
        updatedAt: new Date().toISOString(),
        lastStatusChange: new Date().toISOString()
      };
      
      return {
        success: true,
        message: 'Service status updated successfully',
        data: mockServices[serviceIndex],
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update service status',
        data: {} as Service,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Delete service
  async deleteService(id: number | string): Promise<ApiResponse<boolean>> {
    try {
      // In a real app, this would be an API call
      const serviceIndex = mockServices.findIndex(s => s.id === id);
      
      if (serviceIndex === -1) {
        return {
          success: false,
          message: 'Service not found',
          data: false,
          error: 'Service not found'
        };
      }
      
      mockServices.splice(serviceIndex, 1);
      
      return {
        success: true,
        message: 'Service deleted successfully',
        data: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete service',
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new ServiceManagementService();
