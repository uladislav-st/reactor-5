import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { SlotState } from '../../enums/SlotState';
import { SlotViewModel } from './SlotViewModel';

export class HUDViewModel {
  readonly betOptions = [10, 25, 50, 100, 250, 500];

  private betIndex = 2;

  constructor(private readonly slotViewModel: SlotViewModel) {}

  get balance(): number {
    return this.slotViewModel.model.balance;
  }

  get bet(): number {
    return this.betOptions[this.betIndex] ?? this.betOptions[0];
  }

  get win(): number {
    return this.slotViewModel.model.win;
  }

  get canSpin(): boolean {
    return this.slotViewModel.stateMachine.canRequestSpin() && this.balance >= this.bet;
  }

  setBalance(value: number): void {
    this.slotViewModel.model.balance = Math.max(0, value);
    this.emitStateChanged();
  }

  requestSpin(): void {
    if (!this.canSpin) {
      return;
    }

    this.slotViewModel.requestSpin(this.bet);
    this.emitStateChanged();
  }

  increaseBet(): void {
    if (this.betIndex >= this.betOptions.length - 1) {
      return;
    }

    this.betIndex += 1;
    this.emitStateChanged();
  }

  decreaseBet(): void {
    if (this.betIndex <= 0) {
      return;
    }

    this.betIndex -= 1;
    this.emitStateChanged();
  }

  syncBetFromSlot(): void {
    const slotBet = this.slotViewModel.model.bet;
    const index = this.betOptions.indexOf(slotBet);
    if (index !== -1) {
      this.betIndex = index;
    }
  }

  formatBalance(): string {
    return String(this.balance);
  }

  formatBet(): string {
    return String(this.bet);
  }

  formatWin(): string {
    return String(this.win);
  }

  notifySlotStateChanged(): void {
    if (this.slotViewModel.model.currentState === SlotState.Completed) {
      this.syncBetFromSlot();
    }

    this.emitStateChanged();
  }

  private emitStateChanged(): void {
    GlobalEventEmitter.emit(EventNames.HUD_STATE_CHANGED, { viewModel: this });
  }
}
