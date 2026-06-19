import { _decorator, Animation, AnimationClip, Component, Enum, EventHandler, Label, sp } from 'cc';
import { isScatterSymbol, isSymbolType, SymbolType } from '../../enums/SymbolType';
import { GameSymbol } from './GameSymbol';

const { ccclass, property, requireComponent } = _decorator;

export type SymbolViewEventName = 'idle' | 'highlight' | 'fadeOut' | 'reelStart' | 'reelStop';

@ccclass('SymbolViewEvent')
export class SymbolViewEvent {
  @property(AnimationClip)
  animation: AnimationClip | null = null;

  @property
  spineAnimationName = '';

  @property([EventHandler])
  events: EventHandler[] = [];
}

@ccclass('SymbolView')
@requireComponent(Animation)
export class SymbolView extends Component {
  static readonly MAX_PRIORITY = 5;

  @property({ type: Enum(SymbolType) })
  symbol: SymbolType = SymbolType.Symbol1;

  @property(Label)
  label: Label | null = null;

  @property(sp.Skeleton)
  spineData: sp.Skeleton | null = null;

  @property(SymbolViewEvent)
  idle: SymbolViewEvent | null = null;

  @property(SymbolViewEvent)
  highlight: SymbolViewEvent | null = null;

  @property(SymbolViewEvent)
  fadeOut: SymbolViewEvent | null = null;

  @property(SymbolViewEvent)
  reelStart: SymbolViewEvent | null = null;

  @property(SymbolViewEvent)
  reelStop: SymbolViewEvent | null = null;

  @property(AnimationClip)
  resetAnimation: AnimationClip | null = null;

  private blurred = false;
  private owner: GameSymbol | null = null;
  private animation: Animation | null = null;

  get id(): string {
    return this.owner?.id ?? String(this.symbol);
  }

  get reelIndex(): number {
    return this.owner?.reelIndex ?? 0;
  }

  get symbolIndex(): number {
    return this.owner?.symbolIndex ?? 0;
  }

  get isBlurred(): boolean {
    return this.blurred;
  }

  protected onLoad(): void {
    this.animation = this.node.getComponent(Animation);
    this.render();
  }

  initialize(symbol: GameSymbol): void {
    this.owner = symbol;
  }

  setSymbol(value: number): void {
    this.symbol = isSymbolType(value) ? value : SymbolType.Symbol1;
    this.render();
  }

  setBlurred(value: boolean): void {
    this.blurred = value;
  }

  playEvent(event: SymbolViewEventName): Promise<void> {
    switch (event) {
      case 'idle':
        return this.playSymbolViewEvent(this.idle);
      case 'highlight':
        return this.playSymbolViewEvent(this.highlight);
      case 'fadeOut':
        return this.playSymbolViewEvent(this.fadeOut);
      case 'reelStart':
        return this.playSymbolViewEvent(this.reelStart);
      case 'reelStop':
        return this.playSymbolViewEvent(this.reelStop);
      default:
        return Promise.resolve();
    }
  }

  resetState(): void {
    this.animation?.stop();
    this.spineData?.getState()?.setEmptyAnimation(0, 0);
  }

  async resetAnimations(): Promise<void> {
    this.resetState();
    await this.playAnimation(this.resetAnimation);
  }

  executeEvents(events: EventHandler[]): void {
    events.forEach((eventHandler) => eventHandler.emit([eventHandler.customEventData]));
  }

  protected onDestroy(): void {
    this.animation?.off(Animation.EventType.FINISHED);
  }

  private async playSymbolViewEvent(event: SymbolViewEvent | null): Promise<void> {
    if (!event) {
      return;
    }

    this.executeEvents(event.events);
    await Promise.all([this.playAnimation(event.animation), this.playSpineAnimation(event.spineAnimationName)]);
  }

  private playAnimation(clip: AnimationClip | null): Promise<void> {
    if (!clip || !this.animation) {
      return Promise.resolve();
    }

    if (this.animation.clips.indexOf(clip) === -1) {
      this.animation.addClip(clip);
    }

    return new Promise((resolve) => {
      this.animation?.once(Animation.EventType.FINISHED, () => resolve());
      this.animation?.play(clip.name);
    });
  }

  private playSpineAnimation(animationName: string): Promise<void> {
    if (!this.spineData || !animationName || this.spineData.findAnimation(animationName) === null) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.spineData?.setAnimation(0, animationName, false);
      this.spineData?.setCompleteListener(() => resolve());
    });
  }

  private render(): void {
    if (this.label) {
      this.label.string = isScatterSymbol(this.symbol) ? 'SC' : String(this.symbol);
    }
  }
}
