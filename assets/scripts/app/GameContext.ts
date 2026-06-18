import { Camera } from 'cc';
import { ApiFactory } from '../api/ApiFactory';
import { IGameApi } from '../api/interfaces/IGameApi';
import { PlayerModel } from '../domain/models/PlayerModel';
import { InputService } from '../infrastructure/InputService';
import { ResourceService } from '../infrastructure/ResourceService';
import { PlayerController } from '../presentation/controllers/PlayerController';
import { PlayerViewModel } from '../presentation/viewmodels/PlayerViewModel';
import { TerminalView } from '../presentation/views/TerminalView';

export class GameContext {
  readonly api: IGameApi;
  readonly inputService = new InputService();
  readonly resourceService = new ResourceService();
  readonly playerModel = new PlayerModel();
  readonly playerViewModel: PlayerViewModel;
  readonly playerController: PlayerController;

  constructor() {
    this.api = ApiFactory.create();
    this.playerViewModel = new PlayerViewModel(this.playerModel);
    this.playerController = new PlayerController(this.playerViewModel, this.inputService);
  }

  init(camera: Camera, terminals: TerminalView[]): void {
    this.inputService.init(camera);
    this.playerController.start();

    for (const terminal of terminals) {
      this.playerController.registerInteractable(terminal);
    }
  }

  dispose(): void {
    this.playerController.stop();
    this.inputService.dispose();
    this.resourceService.clear();
  }

  update(deltaTime: number): void {
    this.playerController.update(deltaTime);
  }
}
