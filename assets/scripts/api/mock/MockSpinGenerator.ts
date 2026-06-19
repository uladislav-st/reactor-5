import { SlotConstants } from '../../core/Constants';
import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';
import { SAMPLE_SPIN_RESPONSE } from './MockData';

export class MockSpinGenerator {
  static generateGrid(): number[][] {
    const grid: number[][] = [];

    for (let row = 0; row < SlotConstants.GRID_ROWS; row += 1) {
      const rowValues: number[] = [];

      for (let column = 0; column < SlotConstants.GRID_COLUMNS; column += 1) {
        rowValues.push(this.generateSymbol());
      }

      grid.push(rowValues);
    }

    return grid;
  }

  static generate(request: SpinRequest, balance: number, isFreeSpin = false): SpinResponse {
    const template = SAMPLE_SPIN_RESPONSE;
    const bet = Math.max(1, request.bet);
    const win = template.win;
    const nextBalance = isFreeSpin ? balance + win : balance - bet + win;

    return {
      ...template,
      bet,
      win,
      balance: nextBalance,
      grid: this.generateGrid(),
      isFreeSpin,
    };
  }

  private static generateSymbol(): number {
    return Math.floor(Math.random() * SlotConstants.SCATTER_SYMBOL) + 1;
  }
}
