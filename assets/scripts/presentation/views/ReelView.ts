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

  @property
  spinSpeed = 900;

  private blurred = false;
  private spinning = false;
  private symbolLibrary: SlotSymbolLibrary | null = null;

  onLoad(): void {
    this.resolveSymbols();
    this.applyLayout();
  }

  getStartFallWorldPosition(out = new Vec3()): Vec3 {
    return this.getPointWorldPosition(this.symbolStartFallPoint, out);
  }

  getEndFallWorldPosition(out = new Vec3()): Vec3 {
    return this.getPointWorldPosition(this.symbolEndFallPoint, out);
  }

  update(deltaTime: number): void {
    if (!this.spinning) {
      return;
    }

    this.updateSpin(deltaTime);
  }

  setSymbols(values: readonly number[]): void {
    this.resolveSymbols();
    if (this.spinning) {
      return;
    }

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

  startSpin(): void {
    this.resolveSymbols();
    this.spinning = true;
    this.setBlurred(true);

    for (const symbol of this.symbols) {
      symbol?.setSymbol(this.getRandomSymbol());
      symbol?.setBlurred(true);
    }
  }

  stopSpin(values: readonly number[]): void {
    this.spinning = false;
    this.blurred = false;
    this.applyLayout();

    for (let row = 0; row < SlotConstants.GRID_ROWS; row += 1) {
      const symbol = this.symbols[row];
      if (!symbol) {
        continue;
      }

      symbol.setSymbolLibrary(this.symbolLibrary);
      symbol.setSymbol(values[row] ?? 1);
      symbol.setBlurred(false);
      symbol.initializeReelValues({ reelIndex: this.node.getSiblingIndex(), symbolIndex: row });
    }
  }

  setSymbolLibrary(value: SlotSymbolLibrary | null): void {
    this.symbolLibrary = value;
    this.resolveSymbols();

    for (const symbol of this.symbols) {
      symbol?.setSymbolLibrary(value);
    }
  }

  setBlurred(value: boolean): void {
    if (this.blurred === value) {
      return;
    }

    this.blurred = value;
    this.resolveSymbols();

    for (const symbol of this.symbols) {
      symbol?.setBlurred(value);
    }
  }

  applyLayout(): void {
    this.resolveSymbols();
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
    this.resolveSymbols();
    this.applyLayout();
  }

  private getPointWorldPosition(point: Node | null, out: Vec3): Vec3 {
    if (!point) {
      return out.set(this.node.worldPosition);
    }

    return out.set(point.worldPosition);
  }

  private updateSpin(deltaTime: number): void {
    const endY = this.symbolEndFallPoint?.position.y ?? -((SlotConstants.GRID_ROWS + 1) * this.symbolSpacing * 0.5);
    const startY = this.symbolStartFallPoint?.position.y ?? (SlotConstants.GRID_ROWS + 1) * this.symbolSpacing * 0.5;

    for (const symbol of this.symbols) {
      if (!symbol) {
        continue;
      }

      const position = symbol.node.position;
      symbol.node.setPosition(position.x, position.y - this.spinSpeed * deltaTime, position.z);

      if (symbol.node.position.y <= endY) {
        symbol.node.setPosition(position.x, this.getTopSymbolY(startY) + this.symbolSpacing, position.z);
        symbol.setSymbol(this.getRandomSymbol());
        symbol.setBlurred(true);
      }
    }
  }

  private getTopSymbolY(defaultY: number): number {
    let topY = defaultY - this.symbolSpacing;

    for (const symbol of this.symbols) {
      if (!symbol) {
        continue;
      }

      topY = Math.max(topY, symbol.node.position.y);
    }

    return topY;
  }

  private getRandomSymbol(): number {
    return Math.floor(Math.random() * SlotConstants.SCATTER_SYMBOL) + 1;
  }

  private resolveSymbols(): void {
    if (this.symbols.filter(Boolean).length >= SlotConstants.GRID_ROWS) {
      return;
    }

    this.symbols = this.node.getComponentsInChildren(GameSymbol);
  }
}
