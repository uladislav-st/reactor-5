import { SpinResponse } from '../dto/SpinResponse';

export const INITIAL_BALANCE = 1000;

export const SAMPLE_SPIN_RESPONSE: SpinResponse = {
  balance: 950,
  bet: 50,
  win: 200,
  grid: [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 1],
    [5, 5, 5, 2, 3],
    [1, 2, 2, 2, 1],
    [3, 4, 5, 1, 2],
  ],
  wins: [
    {
      symbol: 5,
      count: 3,
      amount: 200,
    },
  ],
  isFreeSpin: false,
  isBonus: false,
};
