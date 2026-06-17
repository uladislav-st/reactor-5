import { Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { InputService } from '../../infrastructure/InputService';
import { IInteractable } from '../../interfaces/IInteractable';
import { PlayerViewModel } from '../viewmodels/PlayerViewModel';

export class PlayerController {
  private readonly interactables: IInteractable[] = [];
  private readonly onTap = (tap: { worldPosition: Vec3 }) => this.handleTap(tap.worldPosition);

  constructor(
    private readonly viewModel: PlayerViewModel,
    private readonly inputService: InputService,
  ) {}

  start(): void {
    this.inputService.onTap(this.onTap);
  }

  stop(): void {
    this.inputService.offTap(this.onTap);
  }

  registerInteractable(interactable: IInteractable): void {
    if (!this.interactables.includes(interactable)) {
      this.interactables.push(interactable);
    }
  }

  unregisterInteractable(interactable: IInteractable): void {
    const index = this.interactables.indexOf(interactable);
    if (index >= 0) {
      this.interactables.splice(index, 1);
    }
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
    if (interactable) {
      this.viewModel.moveTo(worldPosition, interactable);
      return;
    }

    this.viewModel.moveTo(worldPosition);
  }

  private findInteractableAt(worldPosition: Vec3): IInteractable | null {
    for (const interactable of this.interactables) {
      if (!interactable.canInteract()) {
        continue;
      }

      if (interactable.isTappedAt(worldPosition, PlayerConstants.TAP_HIT_RADIUS)) {
        return interactable;
      }
    }

    return null;
  }
}
