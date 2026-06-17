export const EventNames = {
  TERMINAL_ACTIVATED: 'terminal:activated',
  PLAYER_STATE_CHANGED: 'player:state-changed',
  PLAYER_MOVE_STARTED: 'player:move-started',
  PLAYER_MOVE_COMPLETED: 'player:move-completed',
  PLAYER_INTERACTION_STARTED: 'player:interaction-started',
  PLAYER_INTERACTION_COMPLETED: 'player:interaction-completed',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];
