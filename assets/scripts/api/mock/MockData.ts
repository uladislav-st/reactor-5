import { SpinResponse } from '../dto/SpinResponse';

export const INITIAL_BALANCE = 1000;

export const SAMPLE_SPIN_RESPONSE: SpinResponse = {
  balance: 950,
  bet: 50,
  win: 200,
  grid: [
    [1, 2, 3, 4, 11],
    [6, 7, 8, 9, 10],
    [5, 5, 5, 2, 3],
    [10, 9, 8, 7, 6],
    [11, 4, 3, 2, 1],
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
