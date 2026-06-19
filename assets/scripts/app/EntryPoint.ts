import { _decorator, Component } from 'cc';
import { ServiceLocator } from '../di/ServiceLocator';
import { InitBuildStrategy, IEntryPointStrategy } from './EntryPointStrategy';
import { GameContext } from './GameContext';

const { ccclass } = _decorator;

@ccclass('EntryPoint')
export class EntryPoint extends Component {
  private context: GameContext | null = null;
  private strategy: IEntryPointStrategy | null = null;

  onLoad(): void {
    this.context = new GameContext();
    ServiceLocator.register('gameContext', this.context);

    this.strategy = this.resolveStrategy();
    this.strategy.run(this.context, this.node.scene!);
  }

  update(deltaTime: number): void {
    this.context?.update(deltaTime);
  }

  onDestroy(): void {
    this.strategy?.dispose();
    this.context?.dispose();
    this.strategy = null;
    this.context = null;
  }

  private resolveStrategy(): IEntryPointStrategy {
    return new InitBuildStrategy();
  }
}
