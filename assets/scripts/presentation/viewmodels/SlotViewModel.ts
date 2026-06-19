import { SpinResponse } from '../../api/dto/SpinResponse';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { SlotModel } from '../../domain/models/SlotModel';
import { SlotStateMachine } from '../../domain/state/SlotStateMachine';

export class SlotViewModel {
  readonly model: SlotModel;
  readonly stateMachine: SlotStateMachine;

  constructor(model: SlotModel) {
    this.model = model;
    this.stateMachine = new SlotStateMachine(model);
  }

  requestSpin(bet: number): void {
    if (!this.stateMachine.canRequestSpin()) {
      return;
    }

    this.model.bet = Math.max(1, bet);
    this.stateMachine.requestSpin();
    this.emitStateChanged();
    GlobalEventEmitter.emit(EventNames.SPIN_REQUESTED, { bet: this.model.bet });
  }

  startSpin(): void {
    this.stateMachine.startSpin();
    this.emitStateChanged();
    GlobalEventEmitter.emit(EventNames.SPIN_STARTED, { bet: this.model.bet });
  }

  applySpinResponse(response: SpinResponse): void {
    this.model.lastResponse = response;
    this.model.bet = response.bet;
    this.model.balance = response.balance;
    this.model.win = response.win;
    this.model.grid = response.grid;
    this.model.wins = response.wins;
    this.model.isFreeSpin = response.isFreeSpin;
    this.model.isBonus = response.isBonus;

    this.stateMachine.evaluate();
    this.emitStateChanged();
    GlobalEventEmitter.emit(EventNames.SPIN_COMPLETED, { response });
  }

  showWin(): void {
    if (this.model.win <= 0) {
      this.complete();
      return;
    }

    this.stateMachine.showWin();
    this.emitStateChanged();
  }

  complete(): void {
    this.stateMachine.complete();
    this.emitStateChanged();
  }

  reset(): void {
    this.stateMachine.reset();
    this.emitStateChanged();
  }

  fail(message: string): void {
    this.stateMachine.fail(message);
    this.emitStateChanged();
  }

  private emitStateChanged(): void {
    GlobalEventEmitter.emit(EventNames.SLOT_STATE_CHANGED, {
      state: this.model.currentState,
      model: this.model,
    });
  }
}
