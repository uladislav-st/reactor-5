import { _decorator, Component, Enum, instantiate, Node, Prefab } from 'cc';
import { SlotConstants } from '../../core/Constants';
import { isSymbolType, SymbolType } from '../../enums/SymbolType';

const { ccclass, property } = _decorator;

@ccclass('SlotSymbolItem')
export class SlotSymbolItem {
  @property({ type: Enum(SymbolType) })
  symbol: SymbolType = SymbolType.Symbol1;

  @property(Prefab)
  symbolViewPrefab: Prefab | null = null;

  @property(Prefab)
  blurredSymbolViewPrefab: Prefab | null = null;

  @property({ type: Prefab, visible: false })
  prefab: Prefab | null = null;

  @property({ type: Prefab, visible: false })
  blurredPrefab: Prefab | null = null;
}

@ccclass('SlotSymbolLibrary')
export class SlotSymbolLibrary extends Component {
  @property([SlotSymbolItem])
  items: SlotSymbolItem[] = [];

  getPrefab(symbol: number, blurred: boolean): Prefab | null {
    const item = this.getItem(symbol);
    if (!item) {
      return null;
    }

    const symbolViewPrefab = item.symbolViewPrefab ?? item.prefab;
    const blurredSymbolViewPrefab = item.blurredSymbolViewPrefab ?? item.blurredPrefab;

    if (blurred) {
      return blurredSymbolViewPrefab ?? symbolViewPrefab;
    }

    return symbolViewPrefab;
  }

  createSymbolNode(symbol: number, blurred: boolean): Node | null {
    const prefab = this.getPrefab(symbol, blurred);
    return prefab ? instantiate(prefab) : null;
  }

  private getItem(symbol: number): SlotSymbolItem | null {
    const symbolType = isSymbolType(symbol) ? symbol : SymbolType.Symbol1;
    return this.items.find((item) => item.symbol === symbolType) ?? null;
  }

  protected onValidate(): void {
    if (this.items.length > SlotConstants.SCATTER_SYMBOL) {
      this.items.length = SlotConstants.SCATTER_SYMBOL;
    }
  }
}
