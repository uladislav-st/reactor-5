import { _decorator, Camera, Component, Node, UITransform } from 'cc';
import { GameContext } from '../../app/GameContext';
import { IGameController } from '../../app/IGameController';
import { PlayerConstants } from '../../core/Constants';
import { PlayerView } from '../views/PlayerView';
import { TerminalView } from '../views/TerminalView';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovementController')
export class PlayerMovementController extends Component implements IGameController {
  @property(Camera)
  camera: Camera | null = null;

  @property(PlayerView)
  playerView: PlayerView | null = null;

  @property([TerminalView])
  terminals: TerminalView[] = [];

  @property(Node)
  movementArea: Node | null = null;

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

  private context: GameContext | null = null;
  private boundPlayerView: PlayerView | null = null;
  private readonly registeredTerminals = new Set<TerminalView>();

  init(context: GameContext): void {
    if (!this.camera) {
      console.error('[PlayerMovementController] Camera is not assigned.');
      return;
    }

    if (!this.playerView) {
      console.error('[PlayerMovementController] PlayerView is not assigned.');
      return;
    }

    this.context = context;
    this.syncMovementSettings();
    this.syncMovementBounds();

    context.inputService.init(this.camera);
    context.playerController.setTapHitRadius(this.tapHitRadius);
    context.playerController.start();
    this.registerTerminals();

    this.playerView.bind(context.playerViewModel);
    this.boundPlayerView = this.playerView;
  }

  update(): void {
    this.syncMovementSettings();
    this.context?.playerController.setTapHitRadius(this.tapHitRadius);
    this.syncMovementBounds();
  }

  dispose(): void {
    this.boundPlayerView?.unbind();
    this.unregisterTerminals();

    this.boundPlayerView = null;
    this.context = null;
  }

  private registerTerminals(): void {
    if (!this.context) {
      return;
    }

    for (const terminal of this.terminals) {
      if (!terminal || this.registeredTerminals.has(terminal)) {
        continue;
      }

      this.context.playerController.registerInteractable(terminal);
      this.registeredTerminals.add(terminal);
    }
  }

  private unregisterTerminals(): void {
    if (!this.context) {
      this.registeredTerminals.clear();
      return;
    }

    for (const terminal of this.registeredTerminals) {
      this.context.playerController.unregisterInteractable(terminal);
    }

    this.registeredTerminals.clear();
  }

  private syncMovementBounds(): void {
    if (!this.context) {
      return;
    }

    if (!this.movementArea) {
      this.context.playerViewModel.setMovementBounds(null);
      return;
    }

    const transform = this.movementArea.getComponent(UITransform);
    if (!transform) {
      console.warn('[PlayerMovementController] Movement area node must have UITransform.');
      this.context.playerViewModel.setMovementBounds(null);
      return;
    }

    this.context.playerViewModel.setMovementBounds(transform.getBoundingBoxToWorld());
  }

  private syncMovementSettings(): void {
    this.context?.playerViewModel.setMovementSettings({
      tapMoveSpeed: this.tapMoveSpeed,
      keyboardMoveSpeed: this.keyboardMoveSpeed,
      arrivalThreshold: this.arrivalThreshold,
      interactionCompleteDuration: this.interactionCompleteDuration,
    });
  }
}
