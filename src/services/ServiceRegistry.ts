import LoggingService from "./LoggingService";
import AuthService from "./AuthService";
import EnhancedApiService from "./EnhancedApiService";
import ActivityTracking from "./ActivityTracking";
import { User } from "@/types/Auth";

/**
 * Service Registry for centralized service management
 * This allows for easy dependency injection and service discovery
 */
class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, unknown> = new Map();
  private initialized = false;

  private constructor() {
    // Register core services in the correct order to avoid circular dependencies
    this.register("logging", LoggingService);
    this.register("auth", AuthService);
    this.register("api", EnhancedApiService);
    this.register("activity", ActivityTracking);

    // Initialize services and resolve circular dependencies
    this.initializeServices();

    console.log("Service Registry initialized");
    this.initialized = true;
  }

  /**
   * Initialize services that have circular dependencies
   * This is called after all services are registered
   */
  private initializeServices(): void {
    // Connect services that have circular dependencies
    ActivityTracking.setLoggingService(LoggingService);

    // Setup activity tracking configuration
    // Instead of directly setting activity tracking, we'll use the LoggingService config
    LoggingService.configure({ enableConsole: true });

    // Setup user ID in LoggingService
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.updateCurrentUser(currentUser);
    }

    // Now we can safely setup activity tracking
    // Always enable activity tracking
    ActivityTracking.trackClicks();
    ActivityTracking.trackFormSubmissions();

    // Now we can use LoggingService properly
    LoggingService.info(
      "service",
      "registry_initialized",
      "Service Registry initialized"
    );
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
  public register(name: string, service: unknown): void {
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
        LoggingService.error(
          "service",
          "service_not_found",
          `Service not found: ${name}`
        );
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
  public getAllServices(): Record<string, unknown> {
    const services: Record<string, unknown> = {};
    this.services.forEach((service, name) => {
      services[name] = service;
    });
    return services;
  }

  /**
   * Update the current user in LoggingService when authentication changes
   */
  public updateCurrentUser(user: User): void {
    if (LoggingService) {
      // Store the user info for logging purposes
      console.log(`Updating current user: ${user?.id}`);
    }
  }
}

// Export singleton instance
export default ServiceRegistry.getInstance();
