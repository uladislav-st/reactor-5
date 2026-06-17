import { EventCallback } from './Types';

export class GlobalEventEmitter {
  private static readonly handlers = new Map<string, Set<EventCallback>>();

  static on(event: string, callback: EventCallback): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(callback);
  }

  static off(event: string, callback: EventCallback): void {
    this.handlers.get(event)?.delete(callback);
  }

  static emit(event: string, ...args: unknown[]): void {
    const callbacks = this.handlers.get(event);
    if (!callbacks) {
      return;
    }

    for (const callback of callbacks) {
      callback(...args);
    }
  }

  static clear(): void {
    this.handlers.clear();
  }
}
