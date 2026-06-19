import { StateMachine } from '../../core/StateMachine';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { GameState } from '../../enums/GameState';
import { SessionModel } from '../models/SessionModel';

const transitions: ReadonlyArray<readonly [GameState, readonly GameState[]]> = [
  [GameState.Booting, [GameState.Loading, GameState.Error]],
  [GameState.Loading, [GameState.Ready, GameState.Error]],
  [GameState.Ready, [GameState.Playing, GameState.Error, GameState.Disposed]],
  [GameState.Playing, [GameState.Paused, GameState.Error, GameState.Disposed]],
  [GameState.Paused, [GameState.Playing, GameState.Error, GameState.Disposed]],
  [GameState.Error, [GameState.Loading, GameState.Disposed]],
  [GameState.Disposed, []],
];

export class GameStateMachine {
  private readonly machine: StateMachine<GameState>;

  constructor(private readonly model: SessionModel) {
    this.machine = new StateMachine(model.currentState, transitions);
    this.machine.onTransition(({ to }) => {
      this.model.currentState = to;
      GlobalEventEmitter.emit(EventNames.GAME_STATE_CHANGED, {
        state: to,
        model: this.model,
      });
    });
  }

  get currentState(): GameState {
    return this.machine.currentState;
  }

  load(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(GameState.Loading);
  }

  ready(): void {
    this.machine.requireTransitionTo(GameState.Ready);
  }

  play(): void {
    this.machine.requireTransitionTo(GameState.Playing);
  }

  pause(): void {
    this.machine.requireTransitionTo(GameState.Paused);
  }

  dispose(): void {
    this.machine.requireTransitionTo(GameState.Disposed);
  }

  fail(message: string): void {
    this.model.errorMessage = message;
    this.machine.requireTransitionTo(GameState.Error);
  }
}
