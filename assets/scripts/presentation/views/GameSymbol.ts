import { _decorator, Component, Node, Prefab } from 'cc';
import { isSymbolType, SymbolType } from '../../enums/SymbolType';
import { SlotSymbolLibrary } from './SlotSymbolLibrary';
import { SymbolView } from './SymbolView';

const { ccclass, property } = _decorator;

@ccclass('GameSymbol')
export class GameSymbol extends Component {
  @property(Node)
  protected symbolViewContainer: Node | null = null;

  protected symbolLibrary: SlotSymbolLibrary | null = null;
  protected symbol: SymbolType = SymbolType.Symbol1;
  protected blurred = false;
  protected symbolView: SymbolView | null = null;
  protected symbolViewNode: Node | null = null;
  protected renderedPrefab: Prefab | null = null;
  protected _reelIndex = 0;
  protected _symbolIndex = 0;

  get id(): string {
    return String(this.symbol);
  }

  get reelIndex(): number {
    return this._reelIndex;
  }

  get symbolIndex(): number {
    return this._symbolIndex;
  }

  setSymbolLibrary(value: SlotSymbolLibrary | null): void {
    this.symbolLibrary = value;
    this.render();
  }

  setSymbol(value: number): void {
    this.symbol = isSymbolType(value) ? value : SymbolType.Symbol1;
    this.render();
  }

  setBlurred(value: boolean): void {
    if (this.blurred === value) {
      return;
    }

    this.blurred = value;
    this.render();
  }

  getSymbol(): SymbolType {
    return this.symbol;
  }

  initializeReelValues(values: { reelIndex: number; symbolIndex: number }): void {
    this._reelIndex = values.reelIndex;
    this._symbolIndex = values.symbolIndex;
    this.symbolView?.initialize(this);
  }

  skipAnimation(): void {
    this.symbolView?.resetState();
  }

  protected onDestroy(): void {
    this.clearSymbolView();
  }

  protected render(): void {
    const prefab = this.symbolLibrary?.getPrefab(this.symbol, this.blurred) ?? null;
    if (!prefab) {
      this.clearSymbolView();
      return;
    }

    if (this.renderedPrefab !== prefab || !this.symbolViewNode?.isValid) {
      this.clearSymbolView();
      const viewNode = this.symbolLibrary?.createSymbolNode(this.symbol, this.blurred) ?? null;
      if (!viewNode) {
        return;
      }

      const root = this.symbolViewContainer ?? this.node;
      root.addChild(viewNode);
      viewNode.setPosition(0, 0, 0);
      this.symbolViewNode = viewNode;
      this.renderedPrefab = prefab;
      this.symbolView = viewNode.getComponent(SymbolView) ?? viewNode.getComponentInChildren(SymbolView);
    }

    this.symbolView?.setSymbol(this.symbol);
    this.symbolView?.setBlurred(this.blurred);
    this.symbolView?.initialize(this);
  }

  protected clearSymbolView(): void {
    if (this.symbolViewNode?.isValid) {
      this.symbolViewNode.destroy();
    }

    this.symbolViewNode = null;
    this.renderedPrefab = null;
    this.symbolView = null;
  }
}
