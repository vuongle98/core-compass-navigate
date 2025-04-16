
import AuthService from "./AuthService";

export type LogLevel = "info" | "warning" | "error" | "debug";

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
};

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableApi: boolean;
  apiEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

/**
 * Logger service for application-wide logging
 */
class LoggingService {
  private static instance: LoggingService;
  private logQueue: LogEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  
  private config: LoggerConfig = {
    minLevel: "info",
    enableConsole: true,
    enableApi: import.meta.env.PROD, // Only send to API in production
    apiEndpoint: "/api/logs",
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  };

  private constructor() {
    this.setupFlushTimer();
    
    // Flush logs on window unload
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Configure logging service
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupFlushTimer();
  }

  /**
   * Log an API request
   */
  public logApiRequest(
    url: string, 
    method: string, 
    data?: any, 
    startTime?: number
  ): number {
    const timestamp = Date.now();
    
    this.log({
      level: "info",
      module: "api",
      action: "request_sent",
      message: `API ${method} ${url}`,
      data: { url, method, requestData: data, timestamp },
    });
    
    return startTime || timestamp;
  }

  /**
   * Log an API response
   */
  public logApiResponse(
    url: string,
    method: string,
    status: number,
    data: any,
    startTime: number
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const level: LogLevel = status >= 400 ? "error" : "info";
    
    this.log({
      level,
      module: "api",
      action: "response_received",
      message: `API ${method} ${url} - ${duration}ms - Status: ${status}`,
      data: { url, method, status, responseData: data, duration },
    });
  }

  /**
   * Log an API error
   */
  public logApiError(
    url: string,
    method: string,
    error: any,
    startTime: number
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.log({
      level: "error",
      module: "api",
      action: "request_failed",
      message: `API Error: ${method} ${url} - ${duration}ms - ${error.message || "Unknown error"}`,
      data: { url, method, error: error.message, stack: error.stack, duration },
    });
  }

  /**
   * Log a user action
   */
  public logUserAction(
    module: string,
    action: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log({
      level: "info",
      module,
      action,
      message,
      data,
    });
  }

  /**
   * Log a message with the specified level
   */
  public log(event: Omit<LogEvent, "timestamp" | "userId">): void {
    const user = AuthService.getCurrentUser();
    
    const logEvent: LogEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userId: user?.id,
    };

    // Skip if below minimum level
    const levels: LogLevel[] = ["debug", "info", "warning", "error"];
    if (levels.indexOf(event.level) < levels.indexOf(this.config.minLevel)) {
      return;
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEvent);
    }

    // Queue for API logging
    if (this.config.enableApi) {
      this.queueLog(logEvent);
    }
  }

  /**
   * Log helpers for different levels
   */
  public info(module: string, action: string, message: string, data?: Record<string, any>): void {
    this.log({ level: "info", module, action, message, data });
  }

  public warn(module: string, action: string, message: string, data?: Record<string, any>): void {
    this.log({ level: "warning", module, action, message, data });
  }

  public error(module: string, action: string, message: string, data?: Record<string, any>): void {
    this.log({ level: "error", module, action, message, data });
  }

  public debug(module: string, action: string, message: string, data?: Record<string, any>): void {
    this.log({ level: "debug", module, action, message, data });
  }

  /**
   * Queue log event for batch sending
   */
  private queueLog(event: LogEvent): void {
    this.logQueue.push(event);
    
    // Flush if we've reached batch size
    if (this.logQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(event: LogEvent): void {
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${event.level.toUpperCase()}] [${event.module}]`;
    
    // Format based on log level
    switch (event.level) {
      case "error":
        console.error(`${prefix} ${event.action}: ${event.message}`, event.data || '');
        break;
      case "warning":
        console.warn(`${prefix} ${event.action}: ${event.message}`, event.data || '');
        break;
      case "debug":
        console.debug(`${prefix} ${event.action}: ${event.message}`, event.data || '');
        break;
      case "info":
      default:
        console.log(`${prefix} ${event.action}: ${event.message}`, event.data || '');
        break;
    }
  }

  /**
   * Set up timer to periodically flush logs
   */
  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    if (this.config.enableApi && this.config.flushInterval) {
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  /**
   * Flush logged events to API
   */
  public flush(force: boolean = false): void {
    if (!this.config.enableApi || (!force && this.logQueue.length === 0)) {
      return;
    }
    
    const logs = [...this.logQueue];
    this.logQueue = [];
    
    // In development, just console log the batch
    if (import.meta.env.DEV) {
      console.debug('[LoggingService] Would send logs to API:', logs);
      return;
    }
    
    // In production, send to API
    fetch(this.config.apiEndpoint || '/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getAccessToken() || ''}`,
      },
      body: JSON.stringify({ logs }),
    }).catch(err => {
      console.error('Failed to send logs:', err);
      // Re-queue failed logs
      this.logQueue = [...logs, ...this.logQueue];
    });
  }
}

// Export singleton instance
export default LoggingService.getInstance();
