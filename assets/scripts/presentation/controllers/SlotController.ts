import { _decorator, Component } from 'cc';
import { GameContext } from '../../app/GameContext';
import { IGameController } from '../../app/IGameController';
import { SlotView } from '../views/SlotView';

const { ccclass, property } = _decorator;

@ccclass('SlotController')
export class SlotController extends Component implements IGameController {
  @property(SlotView)
  slotView: SlotView | null = null;

  @property
  renderSampleGridOnInit = true;

  private context: GameContext | null = null;

  init(context: GameContext): void {
    if (!this.slotView) {
      console.error('[SlotController] SlotView is not assigned.');
      return;
    }

    this.context = context;
    this.slotView.bind(context.slotViewModel);

    if (this.renderSampleGridOnInit) {
      context.slotViewModel.setGrid([
        [1, 2, 3, 4, 11],
        [6, 7, 8, 9, 10],
        [5, 5, 5, 2, 3],
        [10, 9, 8, 7, 6],
        [11, 4, 3, 2, 1],
      ]);
    }
  }

  dispose(): void {
    this.slotView?.unbind();
    this.context = null;
  }

  onDestroy(): void {
    this.dispose();
  }
}
