import { _decorator, CCInteger, Node } from 'cc';
import { GameSymbol } from './GameSymbol';

const { ccclass, property } = _decorator;

@ccclass('BlurGameSymbol')
export class BlurGameSymbol extends GameSymbol {
  @property({ type: CCInteger, visible: false })
  protected fallInSpeed = 0;

  @property({ type: CCInteger, visible: false })
  protected fallOutSpeed = 0;

  @property({ type: Node, visible: true })
  protected symbolViewContainerOverride: Node | null = null;

  @property({ type: CCInteger, visible: false })
  protected startSpinDecreaseMultiplier = 1;

  @property({ type: CCInteger, visible: false })
  protected startSpinAcceleration = 1;

  protected onLoad(): void {
    if (this.symbolViewContainerOverride) {
      this.symbolViewContainer = this.symbolViewContainerOverride;
    }
  }
}
