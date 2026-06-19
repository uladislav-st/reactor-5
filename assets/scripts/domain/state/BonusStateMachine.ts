import { StateMachine } from '../../core/StateMachine';
import { BonusState } from '../../enums/BonusState';
import { BonusModel } from '../models/BonusModel';

const transitions: ReadonlyArray<readonly [BonusState, readonly BonusState[]]> = [
  [BonusState.Idle, [BonusState.Buying, BonusState.StartingFreeSpins]],
  [BonusState.Buying, [BonusState.Bought, BonusState.Error]],
  [BonusState.Bought, [BonusState.StartingFreeSpins, BonusState.Completed]],
  [BonusState.StartingFreeSpins, [BonusState.FreeSpins, BonusState.Error]],
  [BonusState.FreeSpins, [BonusState.Completed, BonusState.Error]],
  [BonusState.Completed, [BonusState.Idle]],
  [BonusState.Error, [BonusState.Idle]],
];

export class BonusStateMachine {
  private readonly machine: StateMachine<BonusState>;

  constructor(private readonly model: BonusModel) {
    this.machine = new StateMachine(model.currentState, transitions);
    this.machine.onTransition(({ to }) => {
      this.model.currentState = to;
    });
  }

  get currentState(): BonusState {
    return this.machine.currentState;
  }

  buy(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(BonusState.Buying);
  }

  markBought(): void {
    this.machine.requireTransitionTo(BonusState.Bought);
  }

  startFreeSpins(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(BonusState.StartingFreeSpins);
  }

  enterFreeSpins(): void {
    this.machine.requireTransitionTo(BonusState.FreeSpins);
  }

  complete(): void {
    this.machine.requireTransitionTo(BonusState.Completed);
  }

  reset(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(BonusState.Idle);
  }

  fail(message: string): void {
    this.model.errorMessage = message;
    this.machine.requireTransitionTo(BonusState.Error);
  }
}
