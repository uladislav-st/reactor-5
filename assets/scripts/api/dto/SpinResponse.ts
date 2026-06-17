export interface WinLine {
  symbol: number;
  count: number;
  amount: number;
}

export interface SpinResponse {
  balance: number;
  bet: number;
  win: number;
  grid: number[][];
  wins: WinLine[];
  isFreeSpin: boolean;
  isBonus: boolean;
}
