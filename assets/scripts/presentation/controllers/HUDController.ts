import { _decorator, Component } from 'cc';
import { GameContext } from '../../app/GameContext';
import { IGameController } from '../../app/IGameController';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { HUDView } from '../views/HUDView';

const { ccclass, property } = _decorator;

@ccclass('HUDController')
export class HUDController extends Component implements IGameController {
  @property(HUDView)
  hudView: HUDView | null = null;

  @property
  spinResponseDelayMs = 350;

  private context: GameContext | null = null;
  private isProcessingSpin = false;
  private readonly onSpinRequested = async (payload: unknown): Promise<void> => {
    if (!this.context || this.isProcessingSpin) {
      return;
    }

    const bet = Math.max(1, (payload as { bet?: number }).bet ?? this.context.hudViewModel.bet);
    this.isProcessingSpin = true;

    try {
      this.context.slotViewModel.startSpin();
      await this.delay(this.spinResponseDelayMs);
      const response = await this.context.api.spin({ bet });
      this.context.slotViewModel.applySpinResponse(response);
      this.context.slotViewModel.showWin();
      this.context.slotViewModel.complete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Spin failed';
      this.context.slotViewModel.fail(message);
    } finally {
      this.isProcessingSpin = false;
      this.context?.hudViewModel.notifySlotStateChanged();
    }
  };

  private readonly onSlotStateChanged = (): void => {
    this.context?.hudViewModel.notifySlotStateChanged();
  };

  init(context: GameContext): void {
    if (!this.hudView) {
      console.error('[HUDController] HUDView is not assigned.');
      return;
    }

    this.context = context;
    this.hudView.bind(context.hudViewModel);
    GlobalEventEmitter.on(EventNames.SPIN_REQUESTED, this.onSpinRequested);
    GlobalEventEmitter.on(EventNames.SLOT_STATE_CHANGED, this.onSlotStateChanged);
    void this.loadBalance();
  }

  dispose(): void {
    GlobalEventEmitter.off(EventNames.SPIN_REQUESTED, this.onSpinRequested);
    GlobalEventEmitter.off(EventNames.SLOT_STATE_CHANGED, this.onSlotStateChanged);
    this.hudView?.unbind();
    this.context = null;
    this.isProcessingSpin = false;
  }

  protected onDestroy(): void {
    this.dispose();
  }

  private async loadBalance(): Promise<void> {
    if (!this.context) {
      return;
    }

    const balance = await this.context.api.getBalance();
    this.context.hudViewModel.setBalance(balance);
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));
  }
}
