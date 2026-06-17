export class Container {
  private readonly services = new Map<string, unknown>();

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  resolve<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service not registered: ${key}`);
    }

    return this.services.get(key) as T;
  }

  tryResolve<T>(key: string): T | null {
    return (this.services.get(key) as T) ?? null;
  }
}
