import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';
import { BonusResponse } from '../dto/BonusResponse';

export interface IGameApi {
  spin(request: SpinRequest): Promise<SpinResponse>;

  buyBonus(): Promise<BonusResponse>;

  startFreeSpins(): Promise<SpinResponse>;

  getBalance(): Promise<number>;
}
