import LoggingService from "./LoggingService";
import AuthService from "./AuthService";
import EnhancedApiService from "./EnhancedApiService";
import ActivityTracking from "./ActivityTracking";

/**
 * Service Registry for centralized service management
 * This allows for easy dependency injection and service discovery
 */
class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();
  private initialized = false;
  
  private constructor() {
    // Register core services in the correct order to avoid circular dependencies
    this.register('logging', LoggingService);
    this.register('auth', AuthService);
    this.register('api', EnhancedApiService);
    this.register('activity', ActivityTracking);
    
    // Initialize services and resolve circular dependencies
    this.initializeServices();
    
    console.log('Service Registry initialized');
    this.initialized = true;
  }
  
  /**
   * Initialize services that have circular dependencies
   * This is called after all services are registered
   */
  private initializeServices(): void {
    // Connect services that have circular dependencies
    ActivityTracking.setLoggingService(LoggingService);
    LoggingService.setActivityTracking(true);
    
    // Setup user ID in LoggingService
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id) {
      LoggingService.setUser(currentUser);
    }
    
    // Now we can safely setup activity tracking
    if (true) { // Always enable activity tracking
      ActivityTracking.trackClicks();
      ActivityTracking.trackFormSubmissions();
    }
    
    // Now we can use LoggingService properly
    LoggingService.info('service', 'registry_initialized', 'Service Registry initialized');
  }
  
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }
  
  /**
   * Register a service with the registry
   */
  public register(name: string, service: any): void {
    this.services.set(name, service);
    
    // Use console.log instead of LoggingService to avoid potential circular references
    console.debug(`Service registered: ${name}`);
  }
  
  /**
   * Get a service by name
   */
  public get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      if (this.initialized) {
        LoggingService.error('service', 'service_not_found', `Service not found: ${name}`);
      } else {
        console.error(`Service not found: ${name}`);
      }
      throw new Error(`Service not found: ${name}`);
    }
    return service as T;
  }
  
  /**
   * Check if a service exists
   */
  public has(name: string): boolean {
    return this.services.has(name);
  }
  
  /**
   * Get all registered service names
   */
  public getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }
  
  /**
   * Get all services as an object
   */
  public getAllServices(): Record<string, any> {
    const services: Record<string, any> = {};
    this.services.forEach((service, name) => {
      services[name] = service;
    });
    return services;
  }

  /**
   * Update the current user in LoggingService when authentication changes
   */
  public updateCurrentUser(user: any): void {
    if (LoggingService) {
      LoggingService.setUser(user);
    }
  }
}

// Export singleton instance
export default ServiceRegistry.getInstance();
