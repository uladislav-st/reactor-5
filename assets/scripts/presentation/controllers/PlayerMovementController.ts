import { _decorator, Camera, Component, Node, UITransform, director } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { PlayerModel } from '../../domain/models/PlayerModel';
import { InputService } from '../../infrastructure/InputService';
import { PlayerViewModel } from '../viewmodels/PlayerViewModel';
import { PlayerView } from '../views/PlayerView';
import { TerminalView } from '../views/TerminalView';
import { PlayerController } from './PlayerController';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovementController')
export class PlayerMovementController extends Component {
  @property(Camera)
  camera: Camera | null = null;

  @property(PlayerView)
  playerView: PlayerView | null = null;

  @property([TerminalView])
  terminals: TerminalView[] = [];

  @property(Node)
  movementArea: Node | null = null;

  @property
  autoFindCamera = true;

  @property
  autoFindTerminals = true;

  @property
  tapMoveSpeed = PlayerConstants.TAP_MOVE_SPEED;

  @property
  keyboardMoveSpeed = PlayerConstants.KEYBOARD_MOVE_SPEED;

  @property
  arrivalThreshold = PlayerConstants.ARRIVAL_THRESHOLD;

  @property
  interactionCompleteDuration = PlayerConstants.INTERACTION_COMPLETE_DURATION;

  @property
  tapHitRadius = PlayerConstants.TAP_HIT_RADIUS;

  private inputService: InputService | null = null;
  private playerModel: PlayerModel | null = null;
  private playerViewModel: PlayerViewModel | null = null;
  private playerController: PlayerController | null = null;
  private boundPlayerView: PlayerView | null = null;

  onLoad(): void {
    const camera = this.camera ?? (this.autoFindCamera ? this.findCamera() : null);
    if (!camera) {
      console.error('[PlayerMovementController] Camera is not assigned.');
      return;
    }

    const playerView = this.playerView ?? this.getComponent(PlayerView);
    if (!playerView) {
      console.error('[PlayerMovementController] PlayerView is not assigned.');
      return;
    }

    this.inputService = new InputService();
    this.playerModel = new PlayerModel();
    this.playerViewModel = new PlayerViewModel(this.playerModel);
    this.syncMovementSettings();
    this.playerController = new PlayerController(this.playerViewModel, this.inputService, this.tapHitRadius);
    this.syncMovementBounds();

    this.inputService.init(camera);
    this.playerController.start();
    this.registerTerminals();

    playerView.bind(this.playerViewModel);
    this.boundPlayerView = playerView;
  }

  update(deltaTime: number): void {
    this.syncMovementSettings();
    this.playerController?.setTapHitRadius(this.tapHitRadius);
    this.syncMovementBounds();
    this.playerController?.update(deltaTime);
  }

  onDestroy(): void {
    this.boundPlayerView?.unbind();
    this.playerController?.stop();
    this.inputService?.dispose();

    this.boundPlayerView = null;
    this.playerController = null;
    this.playerViewModel = null;
    this.playerModel = null;
    this.inputService = null;
  }

  private registerTerminals(): void {
    if (!this.playerController) {
      return;
    }

    const terminals = new Set<TerminalView>();
    for (const terminal of this.terminals) {
      if (terminal) {
        terminals.add(terminal);
      }
    }

    if (this.autoFindTerminals) {
      for (const terminal of this.findTerminals()) {
        terminals.add(terminal);
      }
    }

    for (const terminal of terminals) {
      this.playerController.registerInteractable(terminal);
    }
  }

  private syncMovementBounds(): void {
    if (!this.playerViewModel) {
      return;
    }

    if (!this.movementArea) {
      this.playerViewModel.setMovementBounds(null);
      return;
    }

    const transform = this.movementArea.getComponent(UITransform);
    if (!transform) {
      console.warn('[PlayerMovementController] Movement area node must have UITransform.');
      this.playerViewModel.setMovementBounds(null);
      return;
    }

    this.playerViewModel.setMovementBounds(transform.getBoundingBoxToWorld());
  }

  private syncMovementSettings(): void {
    this.playerViewModel?.setMovementSettings({
      tapMoveSpeed: this.tapMoveSpeed,
      keyboardMoveSpeed: this.keyboardMoveSpeed,
      arrivalThreshold: this.arrivalThreshold,
      interactionCompleteDuration: this.interactionCompleteDuration,
    });
  }

  private findCamera(): Camera | null {
    const scene = director.getScene();
    const mainCamera = scene?.getChildByName('Main Camera')?.getComponent(Camera);
    if (mainCamera) {
      return mainCamera;
    }

    return scene ? this.findComponentInChildren(scene, Camera) : null;
  }

  private findTerminals(): TerminalView[] {
    const scene = director.getScene();
    if (!scene) {
      return [];
    }

    const terminals: TerminalView[] = [];
    this.collectComponentsInChildren(scene, TerminalView, terminals);
    return terminals;
  }

  private findComponentInChildren<T extends Component>(
    root: Node,
    componentType: new (...args: never[]) => T,
  ): T | null {
    const component = root.getComponent(componentType);
    if (component) {
      return component;
    }

    for (const child of root.children) {
      const found = this.findComponentInChildren(child, componentType);
      if (found) {
        return found;
      }
    }

    return null;
  }

  private collectComponentsInChildren<T extends Component>(
    root: Node,
    componentType: new (...args: never[]) => T,
    results: T[],
  ): void {
    const component = root.getComponent(componentType);
    if (component) {
      results.push(component);
    }

    for (const child of root.children) {
      this.collectComponentsInChildren(child, componentType, results);
    }
  }
}
