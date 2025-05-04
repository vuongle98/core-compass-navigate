
import AuthService from "./AuthService";
import ActivityTracking from "./ActivityTracking";

export type LogLevel = "info" | "warning" | "error" | "debug";

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
};

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableApi: boolean;
  apiEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  enableActivityTracking?: boolean;
}

export interface LogTransport {
  log: (event: LogEvent) => void;
  flush: () => void;
}

/**
 * Logger service for application-wide logging
 */
class LoggingService {
  private static instance: LoggingService;
  private logQueue: LogEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private transports: LogTransport[] = [];

  private config: LoggerConfig = {
    minLevel: "info",
    enableConsole: true,
    enableApi: import.meta.env.PROD, // Only send to API in production
    apiEndpoint: "/api/logs",
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    enableActivityTracking: true
  };

  private constructor() {
    this.setupFlushTimer();

    // Register default transports
    this.registerConsoleTransport();
    this.registerApiTransport();

    // Flush logs on window unload
    window.addEventListener("beforeunload", () => {
      this.flush(true);
    });
    
    // Setup activity tracking if enabled
    if (this.config.enableActivityTracking) {
      ActivityTracking.trackClicks();
      ActivityTracking.trackFormSubmissions();
    }
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
    const prevConfig = this.config;
    this.config = { ...this.config, ...config };
    
    // Reset flush timer if interval changed
    if (prevConfig.flushInterval !== this.config.flushInterval) {
      this.setupFlushTimer();
    }
    
    // Update activity tracking if configuration changed
    if (prevConfig.enableActivityTracking !== this.config.enableActivityTracking) {
      if (this.config.enableActivityTracking) {
        ActivityTracking.trackClicks();
        ActivityTracking.trackFormSubmissions();
      } else {
        ActivityTracking.stopTrackingClicks();
        ActivityTracking.stopTrackingForms();
      }
    }
  }
  
  /**
   * Register a custom log transport
   */
  public registerTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }
  
  /**
   * Register the default console transport
   */
  private registerConsoleTransport(): void {
    this.registerTransport({
      log: (event: LogEvent) => {
        if (!this.config.enableConsole) return;
        this.logToConsole(event);
      },
      flush: () => {} // Console logging doesn't need flushing
    });
  }
  
  /**
   * Register the default API transport
   */
  private registerApiTransport(): void {
    this.registerTransport({
      log: (event: LogEvent) => {
        if (!this.config.enableApi) return;
        this.queueLog(event);
      },
      flush: () => {
        if (!this.config.enableApi) return;
        this.sendLogsToApi();
      }
    });
  }

  /**
   * Log an API request
   */
  public logApiRequest<T>(
    url: string,
    method: string,
    data?: T,
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
    data: unknown,
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
    
    // Track API response as user activity for non-GET requests that modify data
    if (method !== 'GET' && this.config.enableActivityTracking) {
      ActivityTracking.logActivity('api', method.toLowerCase(), url, {
        status,
        duration
      });
    }
  }

  /**
   * Log an API error
   */
  public logApiError(
    url: string,
    method: string,
    error: unknown,
    startTime: number
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.log({
      level: "error",
      module: "api",
      action: "request_failed",
      message: `API Error: ${method} ${url} - ${duration}ms - ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      data: {
        url,
        method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration,
      },
    });
    
    // Track API errors as user activity
    if (this.config.enableActivityTracking) {
      ActivityTracking.logActivity('error', 'api_error', url, {
        method,
        error: error instanceof Error ? error.message : String(error),
        duration
      });
    }
  }

  /**
   * Log a user action
   */
  public logUserAction(
    module: string,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log({
      level: "info",
      module,
      action,
      message,
      data,
    });
    
    // Also record as user activity
    if (this.config.enableActivityTracking) {
      ActivityTracking.logActivity('user_action', action, module, data as Record<string, any>);
    }
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

    // Send to all registered transports
    this.transports.forEach(transport => {
      transport.log(logEvent);
    });
  }

  /**
   * Log helpers for different levels
   */
  public info(
    module: string,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log({ level: "info", module, action, message, data });
  }

  public warn(
    module: string,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log({ level: "warning", module, action, message, data });
  }

  public error(
    module: string,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    this.log({ level: "error", module, action, message, data });
  }

  public debug(
    module: string,
    action: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
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
    const prefix = `[${timestamp}] [${event.level.toUpperCase()}] [${
      event.module
    }]`;

    // Format based on log level
    switch (event.level) {
      case "error":
        console.error(
          `${prefix} ${event.action}: ${event.message}`,
          event.data || ""
        );
        break;
      case "warning":
        console.warn(
          `${prefix} ${event.action}: ${event.message}`,
          event.data || ""
        );
        break;
      case "debug":
        console.debug(
          `${prefix} ${event.action}: ${event.message}`,
          event.data || ""
        );
        break;
      case "info":
      default:
        console.log(
          `${prefix} ${event.action}: ${event.message}`,
          event.data || ""
        );
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
      this.flushTimer = setInterval(
        () => this.flush(),
        this.config.flushInterval
      );
    }
  }

  /**
   * Send logs to API endpoint
   */
  private sendLogsToApi(): void {
    if (this.logQueue.length === 0 || !this.config.apiEndpoint) {
      return;
    }

    const logs = [...this.logQueue];
    this.logQueue = [];

    // In development, just console log the batch
    if (import.meta.env.DEV) {
      console.debug("[LoggingService] Would send logs to API:", logs);
      return;
    }

    // In production, send to API
    fetch(this.config.apiEndpoint || "/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AuthService.getAccessToken() || ""}`,
      },
      body: JSON.stringify({ logs }),
    }).catch((err) => {
      console.error("Failed to send logs:", err);
      // Re-queue failed logs
      this.logQueue = [...logs, ...this.logQueue];
    });
  }

  /**
   * Flush logged events to all transports
   */
  public flush(force: boolean = false): void {
    if (!force && this.logQueue.length === 0) {
      return;
    }

    // Call flush on all transports
    this.transports.forEach(transport => {
      transport.flush();
    });
    
    // Also flush activity tracking
    if (this.config.enableActivityTracking) {
      ActivityTracking.flush(force);
    }
  }
}

// Export singleton instance
export default LoggingService.getInstance();
