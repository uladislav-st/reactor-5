import { SpinRequest } from '../dto/SpinRequest';
import { SpinResponse } from '../dto/SpinResponse';
import { SAMPLE_SPIN_RESPONSE } from './MockData';

export class MockSpinGenerator {
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
      isFreeSpin,
    };
  }
}
