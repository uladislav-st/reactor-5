import { GameContext } from './GameContext';
import { ServiceLocator } from '../di/ServiceLocator';

export class Application {
  static get context(): GameContext {
    return ServiceLocator.resolve<GameContext>('gameContext');
  }
}
