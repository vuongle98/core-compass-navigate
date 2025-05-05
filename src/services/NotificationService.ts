
import { toast } from "sonner";

/**
 * Service for displaying notifications to the user
 */
class NotificationService {
  /**
   * Show a success notification
   * @param message The message to display
   * @param description Optional description for the notification
   */
  static success(message: string, description?: string) {
    toast.success(message, {
      description,
      position: "top-right",
    });
  }

  /**
   * Show an error notification
   * @param message The message to display
   * @param description Optional description for the notification
   */
  static error(message: string, description?: string) {
    toast.error(message, {
      description,
      position: "top-right",
    });
  }

  /**
   * Show a warning notification
   * @param message The message to display
   * @param description Optional description for the notification
   */
  static warning(message: string, description?: string) {
    toast.warning(message, {
      description,
      position: "top-right",
    });
  }

  /**
   * Show an info notification
   * @param message The message to display
   * @param description Optional description for the notification
   */
  static info(message: string, description?: string) {
    toast.info(message, {
      description,
      position: "top-right",
    });
  }
}

export default NotificationService;
