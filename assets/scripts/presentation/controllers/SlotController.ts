import { _decorator, Component, Node } from 'cc';
import { GameContext } from '../../app/GameContext';
import { IGameController } from '../../app/IGameController';
import { SlotSymbolLibrary } from '../views/SlotSymbolLibrary';
import { SlotView } from '../views/SlotView';

const { ccclass, property } = _decorator;

@ccclass('SlotController')
export class SlotController extends Component implements IGameController {
  @property(SlotView)
  slotView: SlotView | null = null;

  @property
  loadInitialGridOnInit = true;

  private context: GameContext | null = null;

  init(context: GameContext): void {
    this.resolveSceneReferences();

    if (!this.slotView) {
      console.error('[SlotController] SlotView is not assigned.');
      return;
    }

    this.context = context;
    this.resolveSlotDependencies();
    this.slotView.bind(context.slotViewModel);

    if (this.loadInitialGridOnInit) {
      void this.loadInitialGrid(context);
    }
  }

  dispose(): void {
    this.slotView?.unbind();
    this.context = null;
  }

  onDestroy(): void {
    this.dispose();
  }

  private async loadInitialGrid(context: GameContext): Promise<void> {
    try {
      const response = await context.api.initGame();
      context.slotViewModel.model.bet = response.bet;
      context.slotViewModel.model.balance = response.balance;
      context.slotViewModel.setGrid(response.grid);
      context.hudViewModel.setBalance(response.balance);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize slot';
      context.slotViewModel.model.errorMessage = message;
      console.error(`[SlotController] ${message}`);
    }
  }

  private resolveSceneReferences(): void {
    if (!this.slotView) {
      this.slotView = this.findComponentInScene(SlotView);
    }
  }

  private resolveSlotDependencies(): void {
    if (!this.slotView || this.slotView.symbolLibrary) {
      return;
    }

    this.slotView.symbolLibrary = this.findComponentInScene(SlotSymbolLibrary);
  }

  private findComponentInScene<T extends Component>(componentType: new (...args: unknown[]) => T): T | null {
    const scene = this.node.scene;
    if (!scene) {
      return null;
    }

    return this.findComponentInNode(scene, componentType);
  }

  private findComponentInNode<T extends Component>(node: Node, componentType: new (...args: unknown[]) => T): T | null {
    const component = node.getComponent(componentType);
    if (component) {
      return component;
    }

    for (const child of node.children) {
      const childComponent = this.findComponentInNode(child, componentType);
      if (childComponent) {
        return childComponent;
      }
    }

    return null;
  }
}
