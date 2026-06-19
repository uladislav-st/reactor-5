import { GameState } from '../../enums/GameState';

export class SessionModel {
  currentState = GameState.Booting;
  errorMessage = '';
}
