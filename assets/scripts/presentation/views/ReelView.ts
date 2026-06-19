import { _decorator, Component, Node, Vec3 } from 'cc';
import { SlotConstants } from '../../core/Constants';
import { GameSymbol } from './GameSymbol';
import { SlotSymbolLibrary } from './SlotSymbolLibrary';

const { ccclass, property } = _decorator;

@ccclass('ReelView')
export class ReelView extends Component {
  @property([GameSymbol])
  symbols: GameSymbol[] = [];

  @property(Node)
  symbolStartFallPoint: Node | null = null;

  @property(Node)
  symbolEndFallPoint: Node | null = null;

  @property
  symbolSpacing = 120;

  private blurred = false;
  private symbolLibrary: SlotSymbolLibrary | null = null;

  onLoad(): void {
    this.applyLayout();
  }

  getStartFallWorldPosition(out = new Vec3()): Vec3 {
    return this.getPointWorldPosition(this.symbolStartFallPoint, out);
  }

  getEndFallWorldPosition(out = new Vec3()): Vec3 {
    return this.getPointWorldPosition(this.symbolEndFallPoint, out);
  }

  setSymbols(values: readonly number[]): void {
    this.applyLayout();

    for (let row = 0; row < SlotConstants.GRID_ROWS; row += 1) {
      const symbolView = this.symbols[row];
      if (!symbolView) {
        continue;
      }

      symbolView.setSymbolLibrary(this.symbolLibrary);
      symbolView.setSymbol(values[row] ?? 1);
      symbolView.setBlurred(this.blurred);
      symbolView.initializeReelValues({ reelIndex: this.node.getSiblingIndex(), symbolIndex: row });
    }
  }

  setSymbolLibrary(value: SlotSymbolLibrary | null): void {
    this.symbolLibrary = value;

    for (const symbol of this.symbols) {
      symbol?.setSymbolLibrary(value);
    }
  }

  setBlurred(value: boolean): void {
    if (this.blurred === value) {
      return;
    }

    this.blurred = value;

    for (const symbol of this.symbols) {
      symbol?.setBlurred(value);
    }
  }

  applyLayout(): void {
    const centerOffset = (SlotConstants.GRID_ROWS - 1) * this.symbolSpacing * 0.5;

    for (let row = 0; row < SlotConstants.GRID_ROWS; row += 1) {
      const symbolView = this.symbols[row];
      if (!symbolView) {
        continue;
      }

      const position = symbolView.node.position;
      symbolView.node.setPosition(position.x, centerOffset - row * this.symbolSpacing, position.z);
    }
  }

  protected onValidate(): void {
    this.applyLayout();
  }

  private getPointWorldPosition(point: Node | null, out: Vec3): Vec3 {
    if (!point) {
      return out.set(this.node.worldPosition);
    }

    return out.set(point.worldPosition);
  }
}
