import { _decorator, Button, Component, Label } from 'cc';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { HUDViewModel } from '../viewmodels/HUDViewModel';

const { ccclass, property } = _decorator;

@ccclass('HUDView')
export class HUDView extends Component {
  @property(Label)
  balanceLabel: Label | null = null;

  @property(Label)
  betLabel: Label | null = null;

  @property(Label)
  winLabel: Label | null = null;

  @property(Button)
  spinButton: Button | null = null;

  @property(Button)
  decreaseBetButton: Button | null = null;

  @property(Button)
  increaseBetButton: Button | null = null;

  private viewModel: HUDViewModel | null = null;
  private readonly onHudStateChanged = (payload: unknown) => {
    const viewModel = (payload as { viewModel?: HUDViewModel }).viewModel;
    if (viewModel === this.viewModel) {
      this.render();
    }
  };

  bind(viewModel: HUDViewModel): void {
    this.viewModel = viewModel;
    this.registerButtons();
    GlobalEventEmitter.on(EventNames.HUD_STATE_CHANGED, this.onHudStateChanged);
    this.render();
  }

  unbind(): void {
    GlobalEventEmitter.off(EventNames.HUD_STATE_CHANGED, this.onHudStateChanged);
    this.unregisterButtons();
    this.viewModel = null;
  }

  protected onDestroy(): void {
    this.unbind();
  }

  private registerButtons(): void {
    this.spinButton?.node.on(Button.EventType.CLICK, this.onSpinClicked, this);
    this.decreaseBetButton?.node.on(Button.EventType.CLICK, this.onDecreaseBetClicked, this);
    this.increaseBetButton?.node.on(Button.EventType.CLICK, this.onIncreaseBetClicked, this);
  }

  private unregisterButtons(): void {
    this.spinButton?.node.off(Button.EventType.CLICK, this.onSpinClicked, this);
    this.decreaseBetButton?.node.off(Button.EventType.CLICK, this.onDecreaseBetClicked, this);
    this.increaseBetButton?.node.off(Button.EventType.CLICK, this.onIncreaseBetClicked, this);
  }

  private onSpinClicked(): void {
    this.viewModel?.requestSpin();
  }

  private onDecreaseBetClicked(): void {
    this.viewModel?.decreaseBet();
  }

  private onIncreaseBetClicked(): void {
    this.viewModel?.increaseBet();
  }

  private render(): void {
    if (!this.viewModel) {
      return;
    }

    if (this.balanceLabel) {
      this.balanceLabel.string = this.viewModel.formatBalance();
    }

    if (this.betLabel) {
      this.betLabel.string = this.viewModel.formatBet();
    }

    if (this.winLabel) {
      this.winLabel.string = this.viewModel.formatWin();
    }

    if (this.spinButton) {
      this.spinButton.interactable = this.viewModel.canSpin;
    }

    if (this.decreaseBetButton) {
      this.decreaseBetButton.interactable = true;
    }

    if (this.increaseBetButton) {
      this.increaseBetButton.interactable = true;
    }
  }
}
