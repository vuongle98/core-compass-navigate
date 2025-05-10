
interface User {
  id: string;
  name?: string;
  email?: string;
}

interface LogEntry {
  module: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class LoggingService {
  private static config = {
    logLevel: "info",
    enableConsole: true,
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
  };

  private static currentUser: User | null = null;
  private static logQueue: LogEntry[] = [];
  private static flushTimer: number | null = null;
  private static isFlushing: boolean = false;

  static configure(options: { 
    logLevel?: string; 
    enableConsole?: boolean; 
    batchSize?: number; 
    flushInterval?: number 
  }) {
    LoggingService.config = {
      ...LoggingService.config,
      ...options,
    };
    
    // Start the flush timer if it's not already running
    LoggingService.setupFlushTimer();
  }
  
  private static setupFlushTimer() {
    if (LoggingService.flushTimer === null && typeof window !== 'undefined') {
      LoggingService.flushTimer = window.setInterval(
        () => LoggingService.flush(), 
        LoggingService.config.flushInterval
      );
    }
  }
  
  private static async flush() {
    // If there are no logs or we're already flushing, skip
    if (LoggingService.logQueue.length === 0 || LoggingService.isFlushing) {
      return;
    }
    
    LoggingService.isFlushing = true;
    
    try {
      // Get all logs from the queue
      const logsToSend = [...LoggingService.logQueue];
      LoggingService.logQueue = [];
      
      if (LoggingService.config.enableConsole) {
        console.log(`[LOG BATCH] Sending ${logsToSend.length} logs to server`);
      }
      
      // In a real app, we'd send these to the server
      // await fetch('/api/logs/batch', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ logs: logsToSend }),
      // });
      
      // For now, just log to console
      if (LoggingService.config.enableConsole) {
        console.log('[LOG BATCH] Logs sent successfully', logsToSend);
      }
    } catch (error) {
      // If we fail to send, put the logs back in the queue
      console.error('[LOG BATCH] Error sending logs', error);
      LoggingService.logQueue = [...LoggingService.logQueue, ...LoggingService.logQueue];
    } finally {
      LoggingService.isFlushing = false;
    }
  }

  static log(message: string, data?: unknown) {
    if (LoggingService.config.enableConsole) {
      console.log(`[LOG] ${message}`, data || "");
    }
  }

  static error(
    message: string | Error,
    contextOrData?: unknown,
    description?: string,
    data?: unknown
  ) {
    if (LoggingService.config.enableConsole) {
      if (typeof message === "string" && contextOrData && description) {
        console.error(
          `[ERROR] ${contextOrData}:${message} - ${description}`,
          data || ""
        );
      } else {
        console.error(`[ERROR] ${message}`, contextOrData || "");
      }
    }
    
    // Add to batch queue
    LoggingService.addToQueue('error', typeof message === 'string' ? message : message.message, {
      context: contextOrData,
      description,
      data,
      stack: message instanceof Error ? message.stack : undefined
    });
  }

  static info(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    if (LoggingService.config.enableConsole && LoggingService.config.logLevel !== 'error') {
      if (action && description) {
        console.info(`[INFO] ${module}:${action} - ${description}`, data || "");
      } else if (action) {
        console.info(`[INFO] ${module} - ${action}`, description || "");
      } else {
        console.info(`[INFO] ${module}`, action || "");
      }
    }
    
    // Add to batch queue
    LoggingService.addToQueue('info', module, {
      action,
      description,
      data
    });
  }

  static warn(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    if (LoggingService.config.enableConsole && LoggingService.config.logLevel !== 'error') {
      if (action && description) {
        console.warn(`[WARN] ${module}:${action} - ${description}`, data || "");
      } else if (action) {
        console.warn(`[WARN] ${module} - ${action}`, description || "");
      } else {
        console.warn(`[WARN] ${module}`, action || "");
      }
    }
    
    // Add to batch queue
    LoggingService.addToQueue('warning', module, {
      action,
      description,
      data
    });
  }

  static warning(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    return this.warn(module, action, description, data);
  }

  static debug(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    if (
      LoggingService.config.logLevel === "debug" &&
      LoggingService.config.enableConsole
    ) {
      if (action && description) {
        console.debug(
          `[DEBUG] ${module}:${action} - ${description}`,
          data || ""
        );
      } else if (action) {
        console.debug(`[DEBUG] ${module} - ${action}`, description || "");
      } else {
        console.debug(`[DEBUG] ${module}`, action || "");
      }
    }
    
    // Only add debug logs to queue if debug level is enabled
    if (LoggingService.config.logLevel === "debug") {
      LoggingService.addToQueue('debug', module, {
        action,
        description,
        data
      });
    }
  }

  static logUserAction(
    module: string,
    action: string,
    description: string | Record<string, unknown>,
    metadata?: Record<string, unknown>
  ) {
    const logData = {
      module,
      action,
      description:
        typeof description === "string"
          ? description
          : JSON.stringify(description),
      timestamp: new Date().toISOString(),
      metadata,
      user: LoggingService.currentUser ? {
        id: LoggingService.currentUser.id,
        email: LoggingService.currentUser.email
      } : undefined
    };

    if (LoggingService.config.enableConsole) {
      if (typeof description === "string") {
        console.log(
          `[USER ACTION] ${module}:${action} - ${description}`,
          metadata || ""
        );
      } else {
        console.log(
          `[USER ACTION] ${module}:${action}`,
          description,
          metadata || ""
        );
      }
    }
    
    // Add to batch queue
    LoggingService.addToQueue('user_action', module, {
      action,
      description: typeof description === 'string' ? description : JSON.stringify(description),
      metadata
    });

    return logData;
  }
  
  private static addToQueue(level: string, message: string, data: Record<string, unknown>) {
    // Skip if logging is disabled
    if (!LoggingService.config.enableConsole) return;
    
    LoggingService.logQueue.push({
      module: level,
      action: message,
      description: typeof data.description === 'string' ? data.description : JSON.stringify(data),
      metadata: data,
      timestamp: new Date().toISOString()
    });
    
    // If we've reached the batch size, flush immediately
    if (LoggingService.logQueue.length >= LoggingService.config.batchSize) {
      LoggingService.flush();
    }
    
    // Make sure we have a flush timer running
    LoggingService.setupFlushTimer();
  }

  static setActivityTracking(enabled: boolean) {
    LoggingService.config.enableConsole = enabled;
    console.log(`[LOG] Activity tracking ${enabled ? "enabled" : "disabled"}`);
    
    // If disabling, flush any remaining logs
    if (!enabled) {
      LoggingService.flush();
    }
  }

  static setUser(user: User) {
    LoggingService.currentUser = user;
    console.log(`[LOG] User set`, user.id || "anonymous");
  }

  static getConfig() {
    return { ...LoggingService.config };
  }
  
  static forceFlush() {
    return LoggingService.flush();
  }
}

export default LoggingService;
