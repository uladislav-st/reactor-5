import { _decorator, Component, Enum, Vec3 } from 'cc';
import { PlayerConstants } from '../../core/Constants';
import { IInteractable } from '../../interfaces/IInteractable';
import { distance2D } from '../../utils/MathUtils';
import { TerminalType } from '../../enums/TerminalType';
import { TerminalViewModel } from '../viewmodels/TerminalViewModel';

const { ccclass, property } = _decorator;

@ccclass('TerminalView')
export class TerminalView extends Component implements IInteractable {
  @property({ type: Enum(TerminalType) })
  terminalType: TerminalType = TerminalType.Standard;

  @property
  interactionRadius = 80;

  @property
  tapRadius = PlayerConstants.TAP_HIT_RADIUS;

  private viewModel: TerminalViewModel | null = null;

  onLoad(): void {
    this.viewModel = new TerminalViewModel(this.terminalType);
  }

  getViewModel(): TerminalViewModel {
    if (!this.viewModel) {
      this.viewModel = new TerminalViewModel(this.terminalType);
    }
    return this.viewModel;
  }

  getInteractionPoint(fromPosition: Vec3): Vec3 {
    const terminalPos = this.node.worldPosition;
    const direction = new Vec3(
      fromPosition.x - terminalPos.x,
      fromPosition.y - terminalPos.y,
      0,
    );

    if (direction.length() === 0) {
      direction.set(0, -1, 0);
    } else {
      direction.normalize();
    }

    return new Vec3(
      terminalPos.x + direction.x * this.interactionRadius,
      terminalPos.y + direction.y * this.interactionRadius,
      terminalPos.z,
    );
  }

  getInteractionRadius(): number {
    return this.interactionRadius;
  }

  canInteract(): boolean {
    return this.getViewModel().canInteract();
  }

  interact(): void {
    this.getViewModel().activate();
  }

  isTappedAt(worldPosition: Vec3, tapRadius: number): boolean {
    const radius = Math.max(tapRadius, this.tapRadius);
    return distance2D(worldPosition, this.node.worldPosition) <= radius;
  }
}
