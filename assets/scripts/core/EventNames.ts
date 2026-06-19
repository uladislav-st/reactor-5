export const EventNames = {
  TERMINAL_ACTIVATED: 'terminal:activated',
  GAME_STATE_CHANGED: 'game:state-changed',
  SLOT_STATE_CHANGED: 'slot:state-changed',
  BONUS_STATE_CHANGED: 'bonus:state-changed',
  SPIN_REQUESTED: 'spin:requested',
  SPIN_STARTED: 'spin:started',
  SPIN_COMPLETED: 'spin:completed',
  BONUS_TRIGGERED: 'bonus:triggered',
  PLAYER_STATE_CHANGED: 'player:state-changed',
  PLAYER_MOVE_STARTED: 'player:move-started',
  PLAYER_MOVE_COMPLETED: 'player:move-completed',
  PLAYER_INTERACTION_STARTED: 'player:interaction-started',
  PLAYER_INTERACTION_COMPLETED: 'player:interaction-completed',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];
