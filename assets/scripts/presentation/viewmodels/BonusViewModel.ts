import { BonusResponse } from '../../api/dto/BonusResponse';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { BonusModel } from '../../domain/models/BonusModel';
import { BonusStateMachine } from '../../domain/state/BonusStateMachine';

export class BonusViewModel {
  readonly model: BonusModel;
  readonly stateMachine: BonusStateMachine;

  constructor(model: BonusModel) {
    this.model = model;
    this.stateMachine = new BonusStateMachine(model);
  }

  buy(): void {
    this.stateMachine.buy();
    this.emitStateChanged();
  }

  applyBuyResponse(response: BonusResponse): void {
    this.model.lastResponse = response;
    this.model.balance = response.balance;
    this.model.message = response.message ?? '';

    if (!response.success) {
      this.fail(response.message ?? 'Bonus purchase failed');
      return;
    }

    this.stateMachine.markBought();
    this.emitStateChanged();
  }

  startFreeSpins(count: number): void {
    this.model.freeSpinsRemaining = Math.max(0, count);
    this.stateMachine.startFreeSpins();
    this.emitStateChanged();
  }

  enterFreeSpins(): void {
    this.stateMachine.enterFreeSpins();
    this.emitStateChanged();
  }

  consumeFreeSpin(): void {
    this.model.freeSpinsRemaining = Math.max(0, this.model.freeSpinsRemaining - 1);

    if (this.model.freeSpinsRemaining === 0) {
      this.complete();
    }
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
    GlobalEventEmitter.emit(EventNames.BONUS_STATE_CHANGED, {
      state: this.model.currentState,
      model: this.model,
    });
  }
}
