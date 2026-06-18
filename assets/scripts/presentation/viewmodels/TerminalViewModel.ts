import { TerminalType } from '../../enums/TerminalType';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';

export class TerminalViewModel {
  readonly terminalType: TerminalType;
  private active = true;

  constructor(terminalType: TerminalType) {
    this.terminalType = terminalType;
  }

  activate(): void {
    if (!this.active) {
      return;
    }

    GlobalEventEmitter.emit(EventNames.TERMINAL_ACTIVATED, {
      terminalType: this.terminalType,
    });
  }

  setActive(value: boolean): void {
    this.active = value;
  }

  canInteract(): boolean {
    return this.active;
  }
}
