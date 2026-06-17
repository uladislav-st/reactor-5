import { Vec3 } from 'cc';

export interface IInteractable {
  getInteractionPoint(fromPosition: Vec3): Vec3;
  getInteractionRadius(): number;
  canInteract(): boolean;
  interact(): void;
  isTappedAt(worldPosition: Vec3, tapRadius: number): boolean;
}
