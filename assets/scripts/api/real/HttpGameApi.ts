import { BonusResponse } from '../dto/BonusResponse';
import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';
import { IGameApi } from '../interfaces/IGameApi';

export class HttpGameApi implements IGameApi {
  async spin(_request: SpinRequest): Promise<SpinResponse> {
    throw new Error('HttpGameApi.spin is not implemented yet');
  }

  async buyBonus(): Promise<BonusResponse> {
    throw new Error('HttpGameApi.buyBonus is not implemented yet');
  }

  async startFreeSpins(): Promise<SpinResponse> {
    throw new Error('HttpGameApi.startFreeSpins is not implemented yet');
  }

  async getBalance(): Promise<number> {
    throw new Error('HttpGameApi.getBalance is not implemented yet');
  }
}
