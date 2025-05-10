
import LoggingService from "@/services/LoggingService";
import ActivityTracking from "@/services/ActivityTracking";
import useUserSettingsStore from "@/store/useUserSettingsStore";

/**
 * Initialize application services on startup
 */
export const initAppServices = () => {
  // Get settings from store
  const settings = useUserSettingsStore.getState().settings;
  
  // Configure logging service
  LoggingService.configure({
    logLevel: "info",
    enableConsole: settings.loggingEnabled,
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
  });

  // Initialize activity tracking
  ActivityTracking.initialize();
  
  // Display initialization message
  console.log("[APP] Services initialized");
  
  return {
    LoggingService,
    ActivityTracking,
  };
};

export default initAppServices;
