import { _decorator, Animation, AnimationClip, Component, Vec3 } from 'cc';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { PlayerState } from '../../enums/PlayerState';
import { PlayerViewModel } from '../viewmodels/PlayerViewModel';

const { ccclass, property } = _decorator;

const STATE_CLIP: Record<PlayerState, string> = {
  [PlayerState.Idle]: 'idle',
  [PlayerState.Walk]: 'walk',
  [PlayerState.Interact]: 'interact',
};

@ccclass('PlayerView')
export class PlayerView extends Component {
  @property(Animation)
  animation: Animation | null = null;

  private viewModel: PlayerViewModel | null = null;
  private readonly onStateChanged = (payload: unknown) => {
    const state = (payload as { state: PlayerState }).state;
    this.playStateAnimation(state);
  };

  bind(viewModel: PlayerViewModel): void {
    this.viewModel = viewModel;
    viewModel.setInitialPosition(this.node.worldPosition);
    this.playStateAnimation(viewModel.model.currentState);
    GlobalEventEmitter.on(EventNames.PLAYER_STATE_CHANGED, this.onStateChanged);
  }

  unbind(): void {
    GlobalEventEmitter.off(EventNames.PLAYER_STATE_CHANGED, this.onStateChanged);
    this.viewModel = null;
  }

  onDestroy(): void {
    this.unbind();
  }

  update(): void {
    if (!this.viewModel) {
      return;
    }

    const { position, facingRight } = this.viewModel.model;
    this.node.setWorldPosition(position);
    const scale = this.node.scale;
    this.node.setScale(facingRight ? Math.abs(scale.x) : -Math.abs(scale.x), scale.y, scale.z);
  }

  private playStateAnimation(state: PlayerState): void {
    if (!this.animation) {
      return;
    }

    const clipName = STATE_CLIP[state];
    const clip = this.animation.clips.find((item: AnimationClip) => item.name === clipName);
    if (!clip) {
      return;
    }

    this.animation.play(clipName);
  }
}
