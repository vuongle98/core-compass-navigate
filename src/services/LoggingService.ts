
// Add or update the LoggingService to support the required methods
class LoggingService {
  private static config = {
    logLevel: 'info',
    enableConsole: true,
  };

  private static currentUser: any = null;

  static configure(options: { logLevel?: string; enableConsole?: boolean }) {
    LoggingService.config = {
      ...LoggingService.config,
      ...options,
    };
  }

  static log(message: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      console.log(`[LOG] ${message}`, data || '');
    }
  }

  static error(message: string | Error, contextOrData?: any, description?: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      if (typeof message === 'string' && contextOrData && description) {
        // Handle the case where error is called with (module, action, description, data)
        console.error(`[ERROR] ${contextOrData}:${message} - ${description}`, data || '');
      } else {
        // Handle the standard case
        console.error(`[ERROR] ${message}`, contextOrData || '');
      }
    }
  }

  static info(module: string, action?: string, description?: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      if (action && description) {
        // Handle the case with all arguments (module, action, description, data)
        console.info(`[INFO] ${module}:${action} - ${description}`, data || '');
      } else if (action) {
        // Handle the case with (module, action, data)
        console.info(`[INFO] ${module} - ${action}`, description || '');
      } else {
        // Handle the simple case with just module and optional data
        console.info(`[INFO] ${module}`, action || '');
      }
    }
  }

  static warn(module: string, action?: string, description?: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      if (action && description) {
        // Handle the case with all arguments (module, action, description, data)
        console.warn(`[WARN] ${module}:${action} - ${description}`, data || '');
      } else if (action) {
        // Handle the case with (module, action, data)
        console.warn(`[WARN] ${module} - ${action}`, description || '');
      } else {
        // Handle the simple case with just module and optional data
        console.warn(`[WARN] ${module}`, action || '');
      }
    }
  }

  static warning(module: string, action?: string, description?: string, data?: any) {
    // Alias for warn to support both naming conventions
    return this.warn(module, action, description, data);
  }

  static debug(module: string, action?: string, description?: string, data?: any) {
    if (LoggingService.config.logLevel === 'debug' && LoggingService.config.enableConsole) {
      if (action && description) {
        // Handle the case with all arguments (module, action, description, data)
        console.debug(`[DEBUG] ${module}:${action} - ${description}`, data || '');
      } else if (action) {
        // Handle the case with (module, action, data)
        console.debug(`[DEBUG] ${module} - ${action}`, description || '');
      } else {
        // Handle the simple case with just module and optional data
        console.debug(`[DEBUG] ${module}`, action || '');
      }
    }
  }

  // Add logUserAction with proper signature to match calls in AuditLog.tsx
  static logUserAction(
    module: string,
    action: string,
    description: string | Record<string, any>,
    metadata?: Record<string, any>
  ) {
    const logData = {
      module,
      action,
      description: typeof description === 'string' ? description : JSON.stringify(description),
      timestamp: new Date().toISOString(),
      metadata
    };
    
    if (LoggingService.config.enableConsole) {
      if (typeof description === 'string') {
        console.log(`[USER ACTION] ${module}:${action} - ${description}`, metadata || '');
      } else {
        console.log(`[USER ACTION] ${module}:${action}`, description, metadata || '');
      }
    }
    
    // In a real app, this would likely send the data to a server
    return logData;
  }

  // Add methods required by ServiceRegistry
  static setActivityTracking(enabled: boolean) {
    // Implementation to enable/disable activity tracking
    LoggingService.config.enableConsole = enabled;
    console.log(`[LOG] Activity tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  static setUser(user: any) {
    LoggingService.currentUser = user;
    console.log(`[LOG] User set`, user?.id || 'anonymous');
  }

  static getConfig() {
    return { ...LoggingService.config };
  }
}

export default LoggingService;
