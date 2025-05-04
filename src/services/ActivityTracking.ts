
import { User } from "@/types/Auth";
import LoggingService from "./LoggingService";

class ActivityTracking {
  private static instance: ActivityTracking;
  private currentUser: User | null = null;
  private enabled = false;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): ActivityTracking {
    if (!ActivityTracking.instance) {
      ActivityTracking.instance = new ActivityTracking();
    }
    return ActivityTracking.instance;
  }
  
  public setUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      LoggingService.setUser(user.id.toString());
    } else {
      LoggingService.setUser(null);
    }
  }
  
  public enable(): void {
    this.enabled = true;
    LoggingService.setActivityTracking(true);
  }
  
  public disable(): void {
    this.enabled = false;
    LoggingService.setActivityTracking(false);
  }
  
  public trackEvent(eventName: string, data?: any): void {
    if (!this.enabled) return;
    
    const userId = this.currentUser?.id || 'anonymous';
    const userName = this.currentUser?.username || 'unknown';
    
    LoggingService.info('activity', eventName, `User ${userName} (${userId}) performed ${eventName}`);
    
    if (data) {
      LoggingService.debug('activity', `${eventName}_data`, '', data);
    }
  }
  
  public trackPageView(path: string): void {
    this.trackEvent('page_view', { path });
  }
  
  public trackClick(elementId: string, elementText?: string): void {
    this.trackEvent('click', { elementId, elementText });
  }
  
  public trackFormSubmit(formId: string, formData?: Record<string, any>): void {
    // Don't log sensitive data
    const safeData = formData ? { ...formData } : {};
    
    // Remove sensitive fields
    if (safeData.password) safeData.password = '********';
    if (safeData.token) safeData.token = '********';
    
    this.trackEvent('form_submit', { formId, ...safeData });
  }
}

export default ActivityTracking;
