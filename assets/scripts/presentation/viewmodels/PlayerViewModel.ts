import { Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { EventNames } from '../../core/EventNames';
import { GlobalEventEmitter } from '../../core/GlobalEventEmitter';
import { PlayerState } from '../../enums/PlayerState';
import { PlayerModel } from '../../domain/models/PlayerModel';
import { IInteractable } from '../../interfaces/IInteractable';
import { distance2D, isArrived, moveTowards2D } from '../../utils/MathUtils';

export class PlayerViewModel {
  readonly model: PlayerModel;

  constructor(model: PlayerModel) {
    this.model = model;
  }

  setInitialPosition(position: Vec3): void {
    this.model.position.set(position);
  }

  moveTo(worldPosition: Vec3, interactable: IInteractable | null = null): void {
    const target = interactable
      ? interactable.getInteractionPoint(this.model.position)
      : worldPosition.clone();

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

    const offset = direction.clone().multiplyScalar(PlayerConstants.KEYBOARD_MOVE_SPEED * deltaTime);
    this.model.position.add(offset);
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

    this.model.position.set(nextPosition);

    if (!isArrived(this.model.position, this.model.targetPosition, PlayerConstants.ARRIVAL_THRESHOLD)) {
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
    this.model.interactionTimer = PlayerConstants.INTERACTION_COMPLETE_DURATION;
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
}
