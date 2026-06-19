import { SpinResponse, WinLine } from '../../api/dto/SpinResponse';
import { SlotState } from '../../enums/SlotState';

export class SlotModel {
  currentState = SlotState.Idle;
  bet = 50;
  balance = 0;
  win = 0;
  grid: number[][] = [];
  wins: WinLine[] = [];
  isFreeSpin = false;
  isBonus = false;
  errorMessage = '';
  lastResponse: SpinResponse | null = null;
}
