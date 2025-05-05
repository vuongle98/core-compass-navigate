/**
 * Service for tracking user activity in the application
 */
import LoggingService from "./LoggingService";

class ActivityTracking {
  private static loggingService: unknown = null;

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
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const id = target.id || "";
        const classes = Array.from(target.classList).join(" ");
        const text = target.textContent?.trim() || "";

        LoggingService.info(
          "user_activity",
          "click",
          `User clicked ${tagName}${id ? "#" + id : ""}${
            text ? ": " + text : ""
          }`,
          { tagName, id, classes, text }
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
        const form = e.target as HTMLFormElement;
        const id = form.id || "";
        const action = form.action || "";
        const method = form.method || "";

        LoggingService.info(
          "user_activity",
          "form_submission",
          `User submitted form${id ? " #" + id : ""}`,
          { id, action, method }
        );
      });
    } catch (error) {
      console.error("Error setting up form tracking", error);
    }
  }

  /**
   * Track page views
   */
  public static trackPageView(path: string, title?: string) {
    LoggingService.info(
      "user_activity",
      "page_view",
      `User viewed page: ${title || path}`,
      { path, title }
    );
  }
}

export default ActivityTracking;
