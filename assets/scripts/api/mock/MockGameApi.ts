import { BonusResponse } from '../dto/BonusResponse';
import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';
import { IGameApi } from '../interfaces/IGameApi';
import { INITIAL_BALANCE } from './MockData';
import { MockSpinGenerator } from './MockSpinGenerator';

export class MockGameApi implements IGameApi {
  private balance = INITIAL_BALANCE;

  async spin(request: SpinRequest): Promise<SpinResponse> {
    const response = MockSpinGenerator.generate(request, this.balance, false);
    this.balance = response.balance;
    return response;
  }

  async buyBonus(): Promise<BonusResponse> {
    const buyPrice = 100;
    if (this.balance < buyPrice) {
      return {
        success: false,
        balance: this.balance,
        message: 'Not enough balance to buy bonus',
      };
    }

    this.balance -= buyPrice;
    return {
      success: true,
      balance: this.balance,
      message: 'Bonus bought successfully',
    };
  }

  async startFreeSpins(): Promise<SpinResponse> {
    const response = MockSpinGenerator.generate({ bet: 50 }, this.balance, true);
    this.balance = response.balance;
    return response;
  }

  async getBalance(): Promise<number> {
    return this.balance;
  }
}
