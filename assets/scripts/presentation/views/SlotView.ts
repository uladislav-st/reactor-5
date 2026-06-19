import { _decorator, Component, Mask, Node } from 'cc';
import { SlotConstants } from '../../core/Constants';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { SlotModel } from '../../domain/models/SlotModel';
import { SlotState } from '../../enums/SlotState';
import { SlotViewModel } from '../viewmodels/SlotViewModel';
import { ReelView } from './ReelView';
import { SlotSymbolLibrary } from './SlotSymbolLibrary';

const { ccclass, property } = _decorator;

@ccclass('SlotView')
export class SlotView extends Component {
  @property([ReelView])
  reels: ReelView[] = [];

  @property
  reelSpacing = 120;

  @property(SlotSymbolLibrary)
  symbolLibrary: SlotSymbolLibrary | null = null;

  @property(Node)
  maskRoot: Node | null = null;

  @property(Mask)
  mask: Mask | null = null;

  @property
  spinDuration = 1.1;

  @property
  reelStopDelay = 0.18;

  private viewModel: SlotViewModel | null = null;
  private spinning = false;
  private stopping = false;
  private readonly onSlotStateChanged = (payload: unknown) => {
    const model = (payload as { model?: SlotModel }).model;
    if (!model) {
      return;
    }

    this.renderState(model);
  };

  onLoad(): void {
    this.resolveReels();
    this.resolveMask();
  }

  bind(viewModel: SlotViewModel): void {
    this.viewModel = viewModel;
    this.resolveReels();
    this.applySymbolLibrary();
    this.applyLayout();
    this.renderGrid(viewModel.model.grid);
    this.setBlurred(viewModel.model.currentState === SlotState.Spinning);
    GlobalEventEmitter.on(EventNames.SLOT_STATE_CHANGED, this.onSlotStateChanged);
  }

  unbind(): void {
    GlobalEventEmitter.off(EventNames.SLOT_STATE_CHANGED, this.onSlotStateChanged);
    this.viewModel = null;
  }

  onDestroy(): void {
    this.unbind();
  }

  renderGrid(grid: readonly (readonly number[])[]): void {
    this.resolveReels();
    this.applySymbolLibrary();
    this.applyLayout();

    if (grid.length === 0) {
      this.renderEmptyGrid();
      return;
    }

    for (let column = 0; column < SlotConstants.GRID_COLUMNS; column += 1) {
      const reel = this.reels[column];
      if (!reel) {
        continue;
      }

      reel.setSymbols(this.getColumnValues(grid, column));
    }
  }

  applyLayout(): void {
    const centerOffset = (SlotConstants.GRID_COLUMNS - 1) * this.reelSpacing * 0.5;

    for (let column = 0; column < SlotConstants.GRID_COLUMNS; column += 1) {
      const reel = this.reels[column];
      if (!reel) {
        continue;
      }

      const position = reel.node.position;
      reel.node.setPosition(column * this.reelSpacing - centerOffset, position.y, position.z);
      reel.setSymbolLibrary(this.symbolLibrary);
      reel.applyLayout();
    }
  }

  protected onValidate(): void {
    this.resolveReels();
    this.resolveMask();
    this.applySymbolLibrary();
    this.applyLayout();
  }

  setBlurred(value: boolean): void {
    for (const reel of this.reels) {
      reel?.setBlurred(value);
    }
  }

  private renderState(model: SlotModel): void {
    if (model.currentState === SlotState.Spinning) {
      this.startSpin();
      return;
    }

    if (this.spinning || this.stopping) {
      void this.stopSpinSequence(model.grid);
      return;
    }

    this.renderGrid(model.grid);
    this.setBlurred(false);
  }

  private startSpin(): void {
    this.resolveReels();
    this.applySymbolLibrary();
    this.spinning = true;

    for (const reel of this.reels) {
      reel?.startSpin();
    }
  }

  private async stopSpinSequence(grid: readonly (readonly number[])[]): Promise<void> {
    if (this.stopping) {
      return;
    }

    this.resolveReels();
    this.applySymbolLibrary();
    this.stopping = true;

    await this.delay(this.spinDuration);

    for (let column = 0; column < SlotConstants.GRID_COLUMNS; column += 1) {
      const reel = this.reels[column];
      if (!reel) {
        continue;
      }

      reel.stopSpin(this.getColumnValues(grid, column));
      await this.delay(this.reelStopDelay);
    }

    this.spinning = false;
    this.stopping = false;
    GlobalEventEmitter.emit(EventNames.SLOT_REELS_STOPPED, { grid });
  }

  private renderEmptyGrid(): void {
    for (let column = 0; column < SlotConstants.GRID_COLUMNS; column += 1) {
      const reel = this.reels[column];
      if (!reel) {
        continue;
      }

      reel.setSymbols([1, 1, 1, 1, 1]);
    }
  }

  private getColumnValues(grid: readonly (readonly number[])[], column: number): number[] {
    const values: number[] = [];

    for (let row = 0; row < SlotConstants.GRID_ROWS; row += 1) {
      values.push(grid[row]?.[column] ?? 1);
    }

    return values;
  }

  private applySymbolLibrary(): void {
    for (const reel of this.reels) {
      reel?.setSymbolLibrary(this.symbolLibrary);
    }
  }

  private resolveMask(): void {
    if (!this.mask && this.maskRoot) {
      this.mask = this.maskRoot.getComponent(Mask);
    }
  }

  private resolveReels(): void {
    if (this.reels.filter(Boolean).length >= SlotConstants.GRID_COLUMNS) {
      return;
    }

    this.reels = this.node.getComponentsInChildren(ReelView);
  }

  private delay(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, seconds) * 1000));
  }
}
