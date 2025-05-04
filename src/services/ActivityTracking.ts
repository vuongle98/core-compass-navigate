import type { LoggingService as LoggingServiceType } from './LoggingService';
import { debounce } from 'lodash';

export interface Activity {
  type: string;
  action: string; 
  module: string;
  path: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ActivityLoggerOptions {
  flushInterval: number;
  batchSize: number;
  endpoint?: string;
  localStorage?: boolean;
  console?: boolean;
}

/**
 * Activity tracking service for user interactions
 * Buffers activities and sends them in batches
 */
class ActivityTracking {
  private static instance: ActivityTracking;
  private buffer: Activity[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushingActivity = false;
  private options: ActivityLoggerOptions = {
    flushInterval: 5000, // 5 seconds
    batchSize: 10,
    endpoint: '/api/analytics/activities',
    localStorage: true,
    console: import.meta.env.DEV
  };
  private loggingService: LoggingServiceType | null = null;

  private constructor() {
    this.setupFlushTimer();
    
    // Capture navigation events
    window.addEventListener('popstate', this.handleNavigation);
    
    // Ensure buffer is flushed before page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  public static getInstance(): ActivityTracking {
    if (!this.instance) {
      this.instance = new ActivityTracking();
    }
    return this.instance;
  }

  /**
   * Set the logging service - to be called after both services are initialized
   */
  public setLoggingService(loggingService: LoggingServiceType): void {
    this.loggingService = loggingService;
  }

  public configure(options: Partial<ActivityLoggerOptions>): void {
    this.options = { ...this.options, ...options };
    this.setupFlushTimer();
    
    if (this.loggingService) {
      this.loggingService.info('activity', 'configured', 'Activity tracking configured', { options });
    } else if (this.options.console) {
      console.log('Activity tracking configured', options);
    }
  }

  /**
   * Log a user action
   */
  public logActivity(type: string, action: string, module: string, metadata?: Record<string, any>): void {
    const activity: Activity = {
      type,
      action,
      module,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      metadata
    };

    // Add to buffer
    this.buffer.push(activity);

    // Log to console if enabled
    if (this.options.console) {
      console.log(`Activity: [${type}] [${module}] ${action}`, metadata || '');
    }

    // Flush if buffer reaches batch size
    if (this.buffer.length >= this.options.batchSize) {
      this.debouncedFlush();
    }
  }

  /**
   * Log click events on tracked elements
   */
  public trackClicks(): void {
    document.addEventListener('click', this.handleClick);
    LoggingService.info('activity', 'click_tracking_enabled', 'Click tracking enabled');
  }

  /**
   * Stop tracking click events
   */
  public stopTrackingClicks(): void {
    document.removeEventListener('click', this.handleClick);
    LoggingService.info('activity', 'click_tracking_disabled', 'Click tracking disabled');
  }

  /**
   * Track form submissions
   */
  public trackFormSubmissions(): void {
    document.addEventListener('submit', this.handleFormSubmit);
    LoggingService.info('activity', 'form_tracking_enabled', 'Form submission tracking enabled');
  }

  /**
   * Stop tracking form submissions
   */
  public stopTrackingForms(): void {
    document.removeEventListener('submit', this.handleFormSubmit);
    LoggingService.info('activity', 'form_tracking_disabled', 'Form submission tracking disabled');
  }

  /**
   * Click event handler with data-attribute based tracking
   */
  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    
    // Look for closest element with tracking attributes
    const trackingElement = this.findTrackingElement(target);
    
    if (trackingElement) {
      const action = trackingElement.dataset.trackAction || 'click';
      const module = trackingElement.dataset.trackModule || 'ui';
      const metadata = this.extractTrackingMetadata(trackingElement);
      
      this.logActivity('click', action, module, metadata);
    }
  };

  /**
   * Form submission handler
   */
  private handleFormSubmit = (event: Event): void => {
    const form = event.target as HTMLFormElement;
    
    if (form) {
      const action = form.dataset.trackAction || 'submit';
      const module = form.dataset.trackModule || 'form';
      const formId = form.id || form.name || 'unknown-form';
      
      this.logActivity('form', action, module, { 
        formId,
        formAction: form.action
      });
    }
  };

  /**
   * Navigation event handler
   */
  private handleNavigation = (): void => {
    this.logActivity('navigation', 'page_view', 'router', { 
      path: window.location.pathname,
      search: window.location.search
    });
  };

  /**
   * Find closest element with tracking attributes
   */
  private findTrackingElement(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;
    
    if (element.hasAttribute('data-track') || element.hasAttribute('data-track-action')) {
      return element;
    }
    
    return this.findTrackingElement(element.parentElement);
  }

  /**
   * Extract tracking metadata from element data attributes
   */
  private extractTrackingMetadata(element: HTMLElement): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Get all data attributes
    for (const key in element.dataset) {
      if (key.startsWith('trackMeta') && key !== 'trackMetadata') {
        // Convert camelCase to snake_case: trackMetaItemId → item_id
        const metaKey = key.replace('trackMeta', '')
          .replace(/([A-Z])/g, '_$1').toLowerCase()
          .replace(/^_/, '');
        
        metadata[metaKey] = element.dataset[key];
      }
    }
    
    // Add element info
    metadata.element_type = element.tagName.toLowerCase();
    if (element.id) metadata.element_id = element.id;
    if (element.className) metadata.element_class = element.className;
    
    return metadata;
  }

  /**
   * Set up timer to periodically flush activities
   */
  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.options.flushInterval);
    
    if (this.options.console) {
      console.log(`Activity flush timer set for ${this.options.flushInterval}ms`);
    }
  }

  /**
   * Debounced flush to avoid too many API calls
   */
  private debouncedFlush = debounce(() => {
    this.flush();
  }, 300);

  /**
   * Flush logged activities
   */
  public flush(immediate = false): void {
    if (this.isFlushingActivity && !immediate) return;
    if (!this.buffer.length) return;
    
    this.isFlushingActivity = true;
    const activities = [...this.buffer];
    this.buffer = [];

    // Store in localStorage if enabled
    if (this.options.localStorage) {
      this.storeActivitiesLocally(activities);
    }

    // Send to API endpoint if available and enabled
    if (this.options.endpoint) {
      // In a real implementation, you would use fetch or axios here
      if (import.meta.env.DEV) {
        // Just log in dev mode
        console.log('Activities would be sent to API:', activities);
        this.isFlushingActivity = false;
      } else {
        // Real API call in production
        fetch(this.options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
          },
          body: JSON.stringify({ activities }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            if (this.loggingService) {
              this.loggingService.info('activity', 'activities_sent', `${activities.length} activities sent to server`);
            }
            return response.json();
          })
          .catch(error => {
            // Add activities back to the buffer for retry
            this.buffer = [...activities, ...this.buffer];
            if (this.loggingService) {
              this.loggingService.error('activity', 'send_failed', 'Failed to send activities', { error });
            } else if (this.options.console) {
              console.error('Failed to send activities', error);
            }
          })
          .finally(() => {
            this.isFlushingActivity = false;
          });
      }
    } else {
      this.isFlushingActivity = false;
    }
  }

  /**
   * Store activities in localStorage
   */
  private storeActivitiesLocally(activities: Activity[]): void {
    try {
      const existingData = localStorage.getItem('user_activities');
      const existingActivities = existingData ? JSON.parse(existingData) : [];
      
      // Combine new and existing activities, keeping only last 100
      const allActivities = [...activities, ...existingActivities]
        .slice(0, 100);
      
      localStorage.setItem('user_activities', JSON.stringify(allActivities));
    } catch (error) {
      LoggingService.error('activity', 'local_storage_failed', 'Failed to store activities in localStorage', { error });
    }
  }

  /**
   * Clear locally stored activities
   */
  public clearLocalActivities(): void {
    try {
      localStorage.removeItem('user_activities');
      LoggingService.info('activity', 'local_storage_cleared', 'Cleared locally stored activities');
    } catch (error) {
      LoggingService.error('activity', 'clear_local_storage_failed', 'Failed to clear local storage', { error });
    }
  }
}

// Export singleton instance
export default ActivityTracking.getInstance();
