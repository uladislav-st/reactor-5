import { Component, Node, Scene } from 'cc';
import { GameContext } from './GameContext';
import { IGameController } from './IGameController';

export interface IEntryPointStrategy {
  run(context: GameContext, scene: Scene): void;
  dispose(): void;
}

export class InitBuildStrategy implements IEntryPointStrategy {
  private controllers: IGameController[] = [];

  run(context: GameContext, scene: Scene): void {
    this.controllers = this.findControllersOnScene(scene);

    for (const controller of this.controllers) {
      controller.init(context);
    }
  }

  dispose(): void {
    for (const controller of this.controllers) {
      controller.dispose();
    }

    this.controllers = [];
  }

  private findControllersOnScene(scene: Scene): IGameController[] {
    const controllers: IGameController[] = [];
    this.collectControllers(scene, controllers);
    return controllers;
  }

  private collectControllers(node: Node, controllers: IGameController[]): void {
    for (const component of node.components) {
      if (this.isGameController(component)) {
        controllers.push(component);
      }
    }

    for (const child of node.children) {
      this.collectControllers(child, controllers);
    }
  }

  private isGameController(component: Component): component is Component & IGameController {
    const candidate = component as Component & Partial<IGameController>;
    return typeof candidate.init === 'function' && typeof candidate.dispose === 'function';
  }
}
