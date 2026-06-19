import { GameContext } from './GameContext';

export interface IGameController {
  init(context: GameContext): void;
  dispose(): void;
}
