
/**
 * A simplified EventEmitter implementation for browser environments
 */
export class EventEmitter {
  private events: Record<string, Function[]> = {};

  /**
   * Register an event listener
   * @param event Event name
   * @param listener Callback function
   */
  public addListener(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  /**
   * Register an event listener (alias for addListener)
   * @param event Event name
   * @param listener Callback function
   */
  public on(event: string, listener: Function): this {
    return this.addListener(event, listener);
  }

  /**
   * Register a one-time event listener
   * @param event Event name
   * @param listener Callback function
   */
  public once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.removeListener(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.addListener(event, onceWrapper);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param listener Callback function to remove
   */
  public removeListener(event: string, listener: Function): this {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  /**
   * Remove all listeners for an event
   * @param event Event name (optional) - if not provided, removes all listeners
   */
  public removeAllListeners(event?: string): this {
    if (event) {
      this.events[event] = [];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * Emit an event
   * @param event Event name
   * @param args Arguments to pass to listeners
   */
  public emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) {
      return false;
    }
    
    this.events[event].forEach(listener => {
      listener(...args);
    });
    
    return true;
  }

  /**
   * Get all listeners for an event
   * @param event Event name
   */
  public listeners(event: string): Function[] {
    return this.events[event] || [];
  }

  /**
   * Get the number of listeners for an event
   * @param event Event name
   */
  public listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }
}
