import { Rect, Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { PlayerModel } from '../../domain/models/PlayerModel';
import { PlayerState } from '../../enums/PlayerState';
import { IInteractable } from '../../interfaces/IInteractable';
import { isArrived, moveTowards2D } from '../../utils/MathUtils';

export interface PlayerMovementSettings {
  tapMoveSpeed: number;
  keyboardMoveSpeed: number;
  arrivalThreshold: number;
  interactionCompleteDuration: number;
}

export class PlayerViewModel {
  readonly model: PlayerModel;
  private movementSettings: PlayerMovementSettings = {
    tapMoveSpeed: PlayerConstants.TAP_MOVE_SPEED,
    keyboardMoveSpeed: PlayerConstants.KEYBOARD_MOVE_SPEED,
    arrivalThreshold: PlayerConstants.ARRIVAL_THRESHOLD,
    interactionCompleteDuration: PlayerConstants.INTERACTION_COMPLETE_DURATION,
  };
  private movementBounds: Rect | null = null;

  constructor(model: PlayerModel) {
    this.model = model;
  }

  setInitialPosition(position: Vec3): void {
    this.model.position.set(this.clampToMovementBounds(position));
  }

  setMovementBounds(bounds: Rect | null): void {
    this.movementBounds = bounds;
    this.model.position.set(this.clampToMovementBounds(this.model.position));

    if (this.model.hasTarget) {
      const target = new Vec3(this.model.targetPosition.x, this.model.position.y, this.model.position.z);
      this.model.targetPosition.set(this.clampToMovementBounds(target));
    }
  }

  setMovementSettings(settings: Partial<PlayerMovementSettings>): void {
    this.movementSettings = {
      ...this.movementSettings,
      ...settings,
    };
  }

  moveTo(worldPosition: Vec3, interactable: IInteractable | null = null): void {
    const rawTarget = interactable
      ? interactable.getInteractionPoint(this.model.position)
      : worldPosition.clone();
    const target = this.clampToMovementBounds(new Vec3(rawTarget.x, this.model.position.y, this.model.position.z));

    this.model.moveSpeed = this.movementSettings.tapMoveSpeed;
    this.model.targetPosition.set(target);
    this.model.hasTarget = true;
    this.model.pendingInteractable = interactable;
    this.setState(PlayerState.Walk);
    GlobalEventEmitter.emit(EventNames.PLAYER_MOVE_STARTED, { target });
  }

  moveByDirection(direction: Vec3, deltaTime: number): void {
    if (this.model.currentState === PlayerState.Interact) {
      return;
    }

    const offset = new Vec3(
      direction.x * this.movementSettings.keyboardMoveSpeed * deltaTime,
      0,
      0,
    );
    this.model.position.add(offset);
    this.model.position.set(this.clampToMovementBounds(this.model.position));
    this.model.moveSpeed = PlayerConstants.MOVE_SPEED;
    this.model.hasTarget = false;
    this.model.pendingInteractable = null;

    if (direction.x !== 0) {
      this.model.facingRight = direction.x > 0;
    }

    if (this.model.currentState !== PlayerState.Walk) {
      this.setState(PlayerState.Walk);
    }
  }

  stopKeyboardMovement(): void {
    if (this.model.currentState === PlayerState.Walk && !this.model.hasTarget) {
      this.setState(PlayerState.Idle);
    }
  }

  update(deltaTime: number): void {
    if (this.model.currentState === PlayerState.Interact) {
      this.updateInteraction(deltaTime);
      return;
    }

    if (this.model.currentState !== PlayerState.Walk || !this.model.hasTarget) {
      return;
    }

    const nextPosition = moveTowards2D(
      this.model.position,
      this.model.targetPosition,
      this.model.moveSpeed * deltaTime,
    );

    const dx = nextPosition.x - this.model.position.x;
    if (dx !== 0) {
      this.model.facingRight = dx > 0;
    }

    this.model.position.set(this.clampToMovementBounds(nextPosition));

    if (!isArrived(this.model.position, this.model.targetPosition, this.movementSettings.arrivalThreshold)) {
      return;
    }

    this.onDestinationReached();
  }

  private onDestinationReached(): void {
    this.model.hasTarget = false;
    const interactable = this.model.pendingInteractable;
    this.model.pendingInteractable = null;

    GlobalEventEmitter.emit(EventNames.PLAYER_MOVE_COMPLETED, {
      position: this.model.position.clone(),
    });

    if (interactable && interactable.canInteract()) {
      this.startInteraction(interactable);
      return;
    }

    this.setState(PlayerState.Idle);
  }

  private startInteraction(interactable: IInteractable): void {
    this.setState(PlayerState.Interact);
    this.model.interactionTimer = this.movementSettings.interactionCompleteDuration;
    GlobalEventEmitter.emit(EventNames.PLAYER_INTERACTION_STARTED, { interactable });
    interactable.interact();
  }

  private updateInteraction(deltaTime: number): void {
    this.model.interactionTimer -= deltaTime;
    if (this.model.interactionTimer > 0) {
      return;
    }

    this.setState(PlayerState.Idle);
    GlobalEventEmitter.emit(EventNames.PLAYER_INTERACTION_COMPLETED);
  }

  private setState(state: PlayerState): void {
    if (this.model.currentState === state) {
      return;
    }

    this.model.currentState = state;
    GlobalEventEmitter.emit(EventNames.PLAYER_STATE_CHANGED, { state });
  }

  private clampToMovementBounds(position: Vec3): Vec3 {
    if (!this.movementBounds) {
      return position.clone();
    }

    return new Vec3(
      Math.min(Math.max(position.x, this.movementBounds.xMin), this.movementBounds.xMax),
      position.y,
      position.z,
    );
  }
}
