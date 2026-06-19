import { ApiFactory } from '../api/ApiFactory';
import { IGameApi } from '../api/interfaces/IGameApi';
import { BonusModel } from '../domain/models/BonusModel';
import { PlayerModel } from '../domain/models/PlayerModel';
import { SessionModel } from '../domain/models/SessionModel';
import { SlotModel } from '../domain/models/SlotModel';
import { WalletModel } from '../domain/models/WalletModel';
import { GameStateMachine } from '../domain/state/GameStateMachine';
import { InputService } from '../infrastructure/InputService';
import { ResourceService } from '../infrastructure/ResourceService';
import { PlayerController } from '../presentation/controllers/PlayerController';
import { BonusViewModel } from '../presentation/viewmodels/BonusViewModel';
import { PlayerViewModel } from '../presentation/viewmodels/PlayerViewModel';
import { SlotViewModel } from '../presentation/viewmodels/SlotViewModel';

export class GameContext {
  readonly api: IGameApi;
  readonly inputService = new InputService();
  readonly resourceService = new ResourceService();
  readonly sessionModel = new SessionModel();
  readonly gameStateMachine = new GameStateMachine(this.sessionModel);
  readonly walletModel = new WalletModel();
  readonly playerModel = new PlayerModel();
  readonly slotModel = new SlotModel();
  readonly bonusModel = new BonusModel();
  readonly playerViewModel: PlayerViewModel;
  readonly slotViewModel: SlotViewModel;
  readonly bonusViewModel: BonusViewModel;
  readonly playerController: PlayerController;

  constructor() {
    this.api = ApiFactory.create();
    this.playerViewModel = new PlayerViewModel(this.playerModel);
    this.slotViewModel = new SlotViewModel(this.slotModel);
    this.bonusViewModel = new BonusViewModel(this.bonusModel);
    this.playerController = new PlayerController(this.playerViewModel, this.inputService);

    this.gameStateMachine.load();
    this.gameStateMachine.ready();
    this.gameStateMachine.play();
  }

  update(deltaTime: number): void {
    this.playerController.update(deltaTime);
  }

  dispose(): void {
    this.playerController.stop();
    this.inputService.dispose();
    this.resourceService.clear();
    this.gameStateMachine.dispose();
  }
}
