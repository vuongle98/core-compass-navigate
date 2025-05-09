interface User {
  id: string;
  name?: string;
  email?: string;
}

class LoggingService {
  private static config = {
    logLevel: "info",
    enableConsole: true,
  };

  private static currentUser: User | null = null;

  static configure(options: { logLevel?: string; enableConsole?: boolean }) {
    LoggingService.config = {
      ...LoggingService.config,
      ...options,
    };
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
  }

  static info(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    if (LoggingService.config.enableConsole) {
      // if (action && description) {
      //   console.info(`[INFO] ${module}:${action} - ${description}`, data || "");
      // } else if (action) {
      //   console.info(`[INFO] ${module} - ${action}`, description || "");
      // } else {
      //   console.info(`[INFO] ${module}`, action || "");
      // }
    }
  }

  static warn(
    module: string,
    action?: string,
    description?: string,
    data?: unknown
  ) {
    if (LoggingService.config.enableConsole) {
      if (action && description) {
        console.warn(`[WARN] ${module}:${action} - ${description}`, data || "");
      } else if (action) {
        console.warn(`[WARN] ${module} - ${action}`, description || "");
      } else {
        console.warn(`[WARN] ${module}`, action || "");
      }
    }
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

    return logData;
  }

  static setActivityTracking(enabled: boolean) {
    LoggingService.config.enableConsole = enabled;
    console.log(`[LOG] Activity tracking ${enabled ? "enabled" : "disabled"}`);
  }

  static setUser(user: User) {
    LoggingService.currentUser = user;
    console.log(`[LOG] User set`, user.id || "anonymous");
  }

  static getConfig() {
    return { ...LoggingService.config };
  }
}

export default LoggingService;
