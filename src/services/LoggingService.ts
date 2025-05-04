
// Add or update the LoggingService to support the required methods
class LoggingService {
  private static config = {
    logLevel: 'info',
    enableConsole: true,
  };

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

  static error(message: string, error?: any) {
    if (LoggingService.config.enableConsole) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }

  static info(message: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  static warn(message: string, data?: any) {
    if (LoggingService.config.enableConsole) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  static debug(message: string, data?: any) {
    if (LoggingService.config.logLevel === 'debug' && LoggingService.config.enableConsole) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  // Add logUserAction with proper signature to match calls in AuditLog.tsx
  static logUserAction(
    module: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ) {
    const logData = {
      module,
      action,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    if (LoggingService.config.enableConsole) {
      console.log(`[USER ACTION] ${module}:${action} - ${description}`, metadata || '');
    }
    
    // In a real app, this would likely send the data to a server
    return logData;
  }

  static getConfig() {
    return { ...LoggingService.config };
  }
}

export default LoggingService;
