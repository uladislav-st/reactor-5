import { _decorator, Camera, Component } from 'cc';
import { ServiceLocator } from '../di/ServiceLocator';
import { PlayerView } from '../presentation/views/PlayerView';
import { TerminalView } from '../presentation/views/TerminalView';
import { GameContext } from './GameContext';

const { ccclass, property } = _decorator;

@ccclass('Bootstrap')
export class Bootstrap extends Component {
  @property(Camera)
  camera: Camera | null = null;

  @property(PlayerView)
  playerView: PlayerView | null = null;

  @property([TerminalView])
  terminals: TerminalView[] = [];

  private context: GameContext | null = null;

  onLoad(): void {
    const camera = this.camera ?? this.findCamera();
    if (!camera) {
      console.error('[Bootstrap] Camera is not assigned.');
      return;
    }

    this.context = new GameContext();
    ServiceLocator.register('gameContext', this.context);
    this.context.init(camera, this.terminals);

    if (this.playerView) {
      this.playerView.bind(this.context.playerViewModel);
    }
  }

  update(deltaTime: number): void {
    this.context?.update(deltaTime);
  }

  onDestroy(): void {
    this.playerView?.unbind();
    this.context?.dispose();
    this.context = null;
  }

  private findCamera(): Camera | null {
    const cameraNode = this.node.scene?.getChildByName('Main Camera');
    return cameraNode?.getComponent(Camera) ?? null;
  }
}
