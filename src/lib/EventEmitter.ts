
type EventCallback = (...args: any[]) => void;

/**
 * A browser-compatible EventEmitter implementation
 */
export class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  /**
   * Register an event listener
   */
  on(event: string, listener: EventCallback): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  /**
   * Remove an event listener
   */
  removeListener(event: string, listener: EventCallback): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  /**
   * Emit an event with arguments
   */
  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events[event];
    if (!listeners || listeners.length === 0) {
      return false;
    }

    listeners.forEach(listener => {
      listener(...args);
    });
    return true;
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, listener: EventCallback): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.removeListener(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
    return this;
  }

  /**
   * Remove all listeners for an event, or all events
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events[event] = [];
    } else {
      this.events = {};
    }
    return this;
  }
}
