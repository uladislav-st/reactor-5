import { StateMachine } from '../../core/StateMachine';
import { SlotModel } from '../models/SlotModel';
import { SlotState } from '../../enums/SlotState';

const transitions: ReadonlyArray<readonly [SlotState, readonly SlotState[]]> = [
  [SlotState.Idle, [SlotState.RequestingSpin]],
  [SlotState.RequestingSpin, [SlotState.Spinning, SlotState.Error]],
  [SlotState.Spinning, [SlotState.Evaluating, SlotState.Error]],
  [SlotState.Evaluating, [SlotState.ShowingWin, SlotState.Completed, SlotState.Error]],
  [SlotState.ShowingWin, [SlotState.Completed, SlotState.Error]],
  [SlotState.Completed, [SlotState.Idle, SlotState.RequestingSpin]],
  [SlotState.Error, [SlotState.Idle]],
];

export class SlotStateMachine {
  private readonly machine: StateMachine<SlotState>;

  constructor(private readonly model: SlotModel) {
    this.machine = new StateMachine(model.currentState, transitions);
    this.machine.onTransition(({ to }) => {
      this.model.currentState = to;
    });
  }

  get currentState(): SlotState {
    return this.machine.currentState;
  }

  canRequestSpin(): boolean {
    return this.machine.canTransitionTo(SlotState.RequestingSpin);
  }

  requestSpin(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(SlotState.RequestingSpin);
  }

  startSpin(): void {
    this.machine.requireTransitionTo(SlotState.Spinning);
  }

  evaluate(): void {
    this.machine.requireTransitionTo(SlotState.Evaluating);
  }

  showWin(): void {
    this.machine.requireTransitionTo(SlotState.ShowingWin);
  }

  complete(): void {
    this.machine.requireTransitionTo(SlotState.Completed);
  }

  reset(): void {
    this.model.errorMessage = '';
    this.machine.requireTransitionTo(SlotState.Idle);
  }

  fail(message: string): void {
    this.model.errorMessage = message;
    this.machine.requireTransitionTo(SlotState.Error);
  }
}
