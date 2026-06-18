import { Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { PlayerState } from '../../enums/PlayerState';
import { IInteractable } from '../../interfaces/IInteractable';

export class PlayerModel {
  readonly position = new Vec3();
  readonly targetPosition = new Vec3();
  currentState = PlayerState.Idle;
  moveSpeed: number = PlayerConstants.MOVE_SPEED;
  facingRight = true;
  hasTarget = false;
  pendingInteractable: IInteractable | null = null;
  interactionTimer = 0;
}
