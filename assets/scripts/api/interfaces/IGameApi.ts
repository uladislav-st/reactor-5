import { BonusResponse } from '../dto/BonusResponse';
import { InitGameResponse } from '../dto/InitGameResponse';
import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';

export interface IGameApi {
  initGame(): Promise<InitGameResponse>;

  spin(request: SpinRequest): Promise<SpinResponse>;

  buyBonus(): Promise<BonusResponse>;

  startFreeSpins(): Promise<SpinResponse>;

  getBalance(): Promise<number>;
}
