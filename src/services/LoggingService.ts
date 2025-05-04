
/**
 * Service for centralized application logging
 */
class LoggingService {
  private static userId: string | null = null;
  private static config = {
    logLevel: 'info',
    enableConsole: true,
    enableActivityTracking: true
  };

  /**
   * Set configuration options
   */
  public static configure(options: { logLevel?: string; enableConsole?: boolean; enableActivityTracking?: boolean }) {
    this.config = {
      ...this.config,
      ...options
    };
  }

  /**
   * Associate logs with a user
   */
  public static setUser(user: any) {
    if (user && user.id) {
      this.userId = typeof user.id === 'string' ? user.id : String(user.id);
    } else {
      this.userId = null;
    }
  }

  /**
   * Set activity tracking service
   */
  public static setActivityTracking(activityTracking: any) {
    // This is just for circular dependency resolution
  }

  /**
   * Log informational message
   */
  public static info(category: string, action: string, message: string, data?: any) {
    this.log('info', category, action, message, data);
  }

  /**
   * Log warning message
   */
  public static warning(category: string, action: string, message: string, data?: any) {
    this.log('warning', category, action, message, data);
  }

  /**
   * Log error message
   */
  public static error(category: string, action: string, message: string, error?: any) {
    this.log('error', category, action, message, error);
  }

  /**
   * Log debug message
   */
  public static debug(category: string, action: string, message: string, data?: any) {
    if (this.config.logLevel === 'debug') {
      this.log('debug', category, action, message, data);
    }
  }

  /**
   * Log user action
   */
  public static logUserAction(action: string, details?: any) {
    this.log('user', 'action', action, details);
  }

  /**
   * Send log to appropriate destinations
   */
  private static log(level: string, category: string, action: string, message: string, data?: any) {
    if (!this.config.enableConsole) return;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      userId: this.userId,
      message,
      data
    };

    // Log to console during development
    if (this.config.enableConsole) {
      switch (level) {
        case 'error':
          console.error(`[${category}] ${message}`, data || '');
          break;
        case 'warning':
          console.warn(`[${category}] ${message}`, data || '');
          break;
        case 'debug':
          console.debug(`[${category}] ${message}`, data || '');
          break;
        default:
          console.log(`[${category}] ${message}`, data || '');
      }
    }
  }
}

export default LoggingService;
