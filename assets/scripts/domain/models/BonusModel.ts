import { BonusResponse } from '../../api/dto/BonusResponse';
import { BonusState } from '../../enums/BonusState';

export class BonusModel {
  currentState = BonusState.Idle;
  balance = 0;
  freeSpinsRemaining = 0;
  message = '';
  errorMessage = '';
  lastResponse: BonusResponse | null = null;
}
