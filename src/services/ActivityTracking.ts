
/**
 * Service for tracking user activity in the application
 */
import LoggingService from "./LoggingService";
import useUserSettingsStore from "@/store/useUserSettingsStore";

class ActivityTracking {
  private static isInitialized = false;
  private static loggingService: unknown = null;

  /**
   * Initialize activity tracking
   */
  public static initialize() {
    if (this.isInitialized) return;
    
    // Get user settings to check if logging is enabled
    const userSettings = useUserSettingsStore.getState().settings;
    
    // Only set up tracking if enabled in user settings
    if (userSettings.loggingEnabled) {
      this.trackClicks();
      this.trackFormSubmissions();
      this.trackNavigationEvents();
    }
    
    this.isInitialized = true;
  }

  /**
   * Set the logging service instance
   */
  public static setLoggingService(service: unknown) {
    this.loggingService = service;
  }

  /**
   * Track user clicks
   */
  public static trackClicks() {
    try {
      document.addEventListener("click", (e) => {
        // Check if logging is still enabled (could have been disabled after initialization)
        if (!useUserSettingsStore.getState().settings.loggingEnabled) return;
        
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const id = target.id || "";
        const classes = Array.from(target.classList).join(" ");
        const text = target.textContent?.trim().substring(0, 50) || "";
        const href = target instanceof HTMLAnchorElement ? target.href : "";

        LoggingService.logUserAction(
          "user_activity",
          "click",
          `User clicked ${tagName}${id ? "#" + id : ""}${
            text ? ": " + text : ""
          }`,
          { tagName, id, classes, text, href }
        );
      });
    } catch (error) {
      console.error("Error setting up click tracking", error);
    }
  }

  /**
   * Track form submissions
   */
  public static trackFormSubmissions() {
    try {
      document.addEventListener("submit", (e) => {
        // Check if logging is still enabled
        if (!useUserSettingsStore.getState().settings.loggingEnabled) return;
        
        const form = e.target as HTMLFormElement;
        const id = form.id || "";
        const action = form.action || "";
        const method = form.method || "";
        const formName = form.getAttribute("name") || "";

        LoggingService.logUserAction(
          "user_activity",
          "form_submission",
          `User submitted form${id ? " #" + id : ""}${formName ? " (" + formName + ")" : ""}`,
          { id, action, method, formName }
        );
      });
    } catch (error) {
      console.error("Error setting up form tracking", error);
    }
  }
  
  /**
   * Track navigation/route changes
   */
  public static trackNavigationEvents() {
    try {
      // For history API
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(state, title, url) {
        // Check if logging is still enabled
        if (useUserSettingsStore.getState().settings.loggingEnabled) {
          LoggingService.logUserAction(
            "user_activity",
            "navigation",
            `User navigated to ${url}`,
            { state, title, url, type: "pushState" }
          );
        }
        
        return originalPushState.apply(this, [state, title, url]);
      };
      
      window.history.replaceState = function(state, title, url) {
        // Check if logging is still enabled
        if (useUserSettingsStore.getState().settings.loggingEnabled) {
          LoggingService.logUserAction(
            "user_activity",
            "navigation",
            `URL changed to ${url}`,
            { state, title, url, type: "replaceState" }
          );
        }
        
        return originalReplaceState.apply(this, [state, title, url]);
      };
      
      // For popstate (back/forward)
      window.addEventListener('popstate', (event) => {
        // Check if logging is still enabled
        if (!useUserSettingsStore.getState().settings.loggingEnabled) return;
        
        LoggingService.logUserAction(
          "user_activity",
          "navigation",
          `User navigated ${event.state ? 'forward' : 'back'} to ${window.location.href}`,
          { state: event.state, url: window.location.href, type: "popstate" }
        );
      });
    } catch (error) {
      console.error("Error setting up navigation tracking", error);
    }
  }

  /**
   * Track page views
   */
  public static trackPageView(path: string, title?: string) {
    // Check if logging is enabled
    if (!useUserSettingsStore.getState().settings.loggingEnabled) return;
    
    LoggingService.logUserAction(
      "user_activity",
      "page_view",
      `User viewed page: ${title || path}`,
      { path, title }
    );
  }
}

export default ActivityTracking;
