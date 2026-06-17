import { Container } from './Container';

export class ServiceLocator {
  private static readonly container = new Container();

  static register<T>(key: string, service: T): void {
    this.container.register(key, service);
  }

  static resolve<T>(key: string): T {
    return this.container.resolve<T>(key);
  }

  static tryResolve<T>(key: string): T | null {
    return this.container.tryResolve<T>(key);
  }
}
