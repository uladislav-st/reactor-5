export type StateValue = string | number;

export interface StateTransition<TState extends StateValue> {
  from: TState;
  to: TState;
}

export type StateTransitionListener<TState extends StateValue> = (
  transition: StateTransition<TState>,
) => void;

export class StateMachine<TState extends StateValue> {
  private state: TState;
  private readonly transitions = new Map<TState, Set<TState>>();
  private readonly listeners = new Set<StateTransitionListener<TState>>();

  constructor(initialState: TState, allowedTransitions: ReadonlyArray<readonly [TState, readonly TState[]]>) {
    this.state = initialState;

    for (const [from, targets] of allowedTransitions) {
      this.transitions.set(from, new Set(targets));
    }
  }

  get currentState(): TState {
    return this.state;
  }

  canTransitionTo(nextState: TState): boolean {
    if (this.state === nextState) {
      return true;
    }

    return this.transitions.get(this.state)?.has(nextState) ?? false;
  }

  transitionTo(nextState: TState): boolean {
    if (!this.canTransitionTo(nextState)) {
      return false;
    }

    if (this.state === nextState) {
      return true;
    }

    const transition = {
      from: this.state,
      to: nextState,
    };

    this.state = nextState;

    for (const listener of this.listeners) {
      listener(transition);
    }

    return true;
  }

  requireTransitionTo(nextState: TState): void {
    if (!this.transitionTo(nextState)) {
      throw new Error(`[StateMachine] Invalid transition: ${String(this.state)} -> ${String(nextState)}`);
    }
  }

  onTransition(listener: StateTransitionListener<TState>): void {
    this.listeners.add(listener);
  }

  offTransition(listener: StateTransitionListener<TState>): void {
    this.listeners.delete(listener);
  }

  clearListeners(): void {
    this.listeners.clear();
  }
}
