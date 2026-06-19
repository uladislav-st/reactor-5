import { Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { InputService } from '../../infrastructure/InputService';
import { IInteractable } from '../../interfaces/IInteractable';
import { PlayerViewModel } from '../viewmodels/PlayerViewModel';

export class PlayerController {
  private readonly interactables: IInteractable[] = [];
  private readonly onTap = (tap: { worldPosition: Vec3 }) => this.handleTap(tap.worldPosition);
  private tapHitRadius: number;

  constructor(
    private readonly viewModel: PlayerViewModel,
    private readonly inputService: InputService,
    tapHitRadius = PlayerConstants.TAP_HIT_RADIUS,
  ) {
    this.tapHitRadius = tapHitRadius;
  }

  start(): void {
    this.inputService.onTap(this.onTap);
  }

  stop(): void {
    this.inputService.offTap(this.onTap);
  }

  registerInteractable(interactable: IInteractable): void {
      this.interactables.push(interactable);
  }

  unregisterInteractable(interactable: IInteractable): void {
    const index = this.interactables.indexOf(interactable);
    if (index >= 0) {
      this.interactables.splice(index, 1);
    }
  }

  setTapHitRadius(value: number): void {
    this.tapHitRadius = value;
  }

  update(deltaTime: number): void {
    const keyboardDirection = this.inputService.getKeyboardDirection();
    if (keyboardDirection) {
      this.viewModel.moveByDirection(keyboardDirection, deltaTime);
    } else {
      this.viewModel.stopKeyboardMovement();
    }

    this.viewModel.update(deltaTime);
  }

  private handleTap(worldPosition: Vec3): void {
    const interactable = this.findInteractableAt(worldPosition);
    if (!interactable) {
      return;
    }

    this.viewModel.moveTo(worldPosition, interactable);
  }

  private findInteractableAt(worldPosition: Vec3): IInteractable | null {
    for (const interactable of this.interactables) {
      if (!interactable.canInteract()) {
        continue;
      }

      if (interactable.isTappedAt(worldPosition, this.tapHitRadius)) {
        return interactable;
      }
    }

    return null;
  }
}
